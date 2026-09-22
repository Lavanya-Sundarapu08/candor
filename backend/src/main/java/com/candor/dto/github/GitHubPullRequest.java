package com.candor.dto.github;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GitHubPullRequest {

    private Integer number;
    private String title;
    private String state;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("merged_at")
    private String mergedAt;

    @JsonProperty("html_url")
    private String htmlUrl;

    private GitHubUser user;

    public Integer getNumber() { return number; }
    public void setNumber(Integer number) { this.number = number; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getMergedAt() { return mergedAt; }
    public void setMergedAt(String mergedAt) { this.mergedAt = mergedAt; }

    public String getHtmlUrl() { return htmlUrl; }
    public void setHtmlUrl(String htmlUrl) { this.htmlUrl = htmlUrl; }

    public GitHubUser getUser() { return user; }
    public void setUser(GitHubUser user) { this.user = user; }

    public boolean isMerged() {
        return mergedAt != null && !mergedAt.isBlank();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GitHubUser {
        private String login;
        public String getLogin() { return login; }
        public void setLogin(String login) { this.login = login; }
    }
}
