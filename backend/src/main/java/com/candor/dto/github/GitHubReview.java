package com.candor.dto.github;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GitHubReview {

    private String body;
    private String state;
    private GitHubUser user;

    @JsonProperty("submitted_at")
    private String submittedAt;

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public GitHubUser getUser() { return user; }
    public void setUser(GitHubUser user) { this.user = user; }

    public String getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }

    public String getReviewerLogin() {
        return user != null && user.getLogin() != null ? user.getLogin() : "unknown";
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GitHubUser {
        private String login;
        public String getLogin() { return login; }
        public void setLogin(String login) { this.login = login; }
    }
}
