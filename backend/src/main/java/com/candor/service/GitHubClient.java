package com.candor.service;

import com.candor.dto.github.GitHubCommit;
import com.candor.dto.github.GitHubFile;
import com.candor.dto.github.GitHubPullRequest;
import com.candor.dto.github.GitHubReview;
import com.candor.exception.GitHubApiException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

/**
 * All calls to GitHub go through here. Every call is fetched as raw text first,
 * then parsed - so if GitHub responds with an error object (e.g. rate limit
 * exceeded) instead of the expected array, we detect that and surface GitHub's
 * actual message instead of crashing with a confusing JSON parsing error.
 */
@Service
public class GitHubClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GitHubClient(@Value("${github.api.base-url}") String baseUrl, ObjectMapper objectMapper) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Accept", "application/vnd.github+json")
                .build();
        this.objectMapper = objectMapper;
    }

    public List<GitHubPullRequest> fetchClosedPullRequests(String owner, String repo, String token, int perPage) {
        String uri = UriComponentsBuilder.fromPath("/repos/{owner}/{repo}/pulls")
                .queryParam("state", "closed")
                .queryParam("sort", "updated")
                .queryParam("direction", "desc")
                .queryParam("per_page", perPage)
                .buildAndExpand(owner, repo)
                .toUriString();
        return fetchArray(uri, token, GitHubPullRequest[].class, owner, repo);
    }

    public List<GitHubReview> fetchReviews(String owner, String repo, int prNumber, String token) {
        String uri = "/repos/" + owner + "/" + repo + "/pulls/" + prNumber + "/reviews";
        return fetchArray(uri, token, GitHubReview[].class, owner, repo);
    }

    public List<GitHubFile> fetchFiles(String owner, String repo, int prNumber, String token) {
        String uri = "/repos/" + owner + "/" + repo + "/pulls/" + prNumber + "/files";
        return fetchArray(uri, token, GitHubFile[].class, owner, repo);
    }

    public List<GitHubCommit> fetchCommitsForPathSince(String owner, String repo, String path,
                                                         String since, String until, String token) {
        String uri = UriComponentsBuilder.fromPath("/repos/{owner}/{repo}/commits")
                .queryParam("path", path)
                .queryParam("since", since)
                .queryParam("until", until)
                .queryParam("per_page", 20)
                .buildAndExpand(owner, repo)
                .toUriString();
        return fetchArray(uri, token, GitHubCommit[].class, owner, repo);
    }

    private <T> List<T> fetchArray(String uri, String token, Class<T[]> arrayType, String owner, String repo) {
        String rawBody;
        try {
            rawBody = restClient.get()
                    .uri(uri)
                    .headers(headers -> applyAuth(headers, token))
                    .retrieve()
                    .body(String.class);
        } catch (RestClientResponseException ex) {
            throw translate(ex, owner, repo);
        }

        if (rawBody == null || rawBody.isBlank()) {
            return List.of();
        }

        try {
            T[] parsed = objectMapper.readValue(rawBody, arrayType);
            return List.of(parsed);
        } catch (JsonProcessingException parseFailure) {
            throw translateUnexpectedBody(rawBody, owner, repo);
        }
    }

    private GitHubApiException translateUnexpectedBody(String rawBody, String owner, String repo) {
        try {
            Map<?, ?> errorObject = objectMapper.readValue(rawBody, Map.class);
            Object message = errorObject.get("message");
            if (message != null) {
                String text = message.toString();
                if (text.toLowerCase().contains("rate limit")) {
                    return new GitHubApiException(
                            "GitHub rate limit reached while analyzing " + owner + "/" + repo
                                    + ". Add a personal access token to raise the limit, or wait an hour and try again.");
                }
                return new GitHubApiException("GitHub responded with an error: " + text);
            }
        } catch (JsonProcessingException ignored) {
            // Body wasn't a recognizable GitHub error object either - fall through to the generic message below.
        }
        return new GitHubApiException(
                "GitHub returned an unexpected response for " + owner + "/" + repo + ". Please try again shortly.");
    }

    private void applyAuth(HttpHeaders headers, String token) {
        if (token != null && !token.isBlank()) {
            headers.setBearerAuth(token);
        }
    }

    private GitHubApiException translate(RestClientResponseException ex, String owner, String repo) {
        if (ex.getStatusCode().value() == 404) {
            return new GitHubApiException("Repository '" + owner + "/" + repo + "' was not found or is private.");
        }
        if (ex.getStatusCode().value() == 403) {
            return new GitHubApiException(
                    "GitHub rate limit reached. Add a personal access token to raise the limit, or wait an hour.");
        }
        return new GitHubApiException("GitHub API call failed: " + ex.getMessage());
    }
}
