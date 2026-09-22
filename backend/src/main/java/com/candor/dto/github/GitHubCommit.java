package com.candor.dto.github;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GitHubCommit {

    private String sha;
    private CommitDetail commit;

    public String getSha() { return sha; }
    public void setSha(String sha) { this.sha = sha; }

    public CommitDetail getCommit() { return commit; }
    public void setCommit(CommitDetail commit) { this.commit = commit; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CommitDetail {
        private String message;
        private CommitAuthor author;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public CommitAuthor getAuthor() { return author; }
        public void setAuthor(CommitAuthor author) { this.author = author; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CommitAuthor {
        private String date;
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
    }
}
