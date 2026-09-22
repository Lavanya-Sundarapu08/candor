package com.candor.service;

import com.candor.dto.FollowUpFixEvidenceDto;
import com.candor.dto.github.GitHubCommit;
import com.candor.dto.github.GitHubFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class FollowUpFixDetector {

    private static final Set<String> FIX_KEYWORDS = Set.of(
            "fix", "fixes", "fixed", "bug", "hotfix", "patch", "revert", "regression"
    );

    private final GitHubClient gitHubClient;
    private final int followUpWindowDays;

    public FollowUpFixDetector(GitHubClient gitHubClient,
                                @Value("${candor.follow-up-window-days:14}") int followUpWindowDays) {
        this.gitHubClient = gitHubClient;
        this.followUpWindowDays = followUpWindowDays;
    }

    public List<FollowUpFixEvidenceDto> findFollowUpFixEvidence(String owner, String repo, List<GitHubFile> files,
                                                                  Instant mergedAt, String token) {
        List<FollowUpFixEvidenceDto> matches = new ArrayList<>();
        Instant windowEnd = mergedAt.plus(followUpWindowDays, ChronoUnit.DAYS);

        for (GitHubFile file : files) {
            List<GitHubCommit> commits = gitHubClient.fetchCommitsForPathSince(
                    owner, repo, file.getFilename(), mergedAt.toString(), windowEnd.toString(), token);

            for (GitHubCommit commit : commits) {
                if (commit.getCommit() == null || commit.getCommit().getMessage() == null) {
                    continue;
                }
                String message = commit.getCommit().getMessage();
                String lower = message.toLowerCase();
                String matchedKeyword = FIX_KEYWORDS.stream().filter(lower::contains).findFirst().orElse(null);
                if (matchedKeyword == null) {
                    continue;
                }

                String commitDate = commit.getCommit().getAuthor() != null
                        ? commit.getCommit().getAuthor().getDate() : null;
                String timeAfterMerge = humanizeTimeAfter(mergedAt, commitDate);

                matches.add(new FollowUpFixEvidenceDto(
                        firstLine(message), file.getFilename(), matchedKeyword, commitDate, timeAfterMerge));
            }
        }
        return matches;
    }

    private String humanizeTimeAfter(Instant mergedAt, String commitDateStr) {
        if (commitDateStr == null) {
            return "unknown time after merge";
        }
        try {
            Instant commitInstant = Instant.parse(commitDateStr);
            Duration duration = Duration.between(mergedAt, commitInstant);
            long hours = duration.toHours();
            if (hours < 1) {
                return "less than an hour later";
            }
            if (hours < 24) {
                return hours + (hours == 1 ? " hour later" : " hours later");
            }
            long days = duration.toDays();
            return days + (days == 1 ? " day later" : " days later");
        } catch (DateTimeParseException ex) {
            return "unknown time after merge";
        }
    }

    private String firstLine(String message) {
        int newline = message.indexOf('\n');
        return newline == -1 ? message : message.substring(0, newline);
    }
}
