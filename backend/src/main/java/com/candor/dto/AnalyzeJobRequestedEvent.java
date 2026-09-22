package com.candor.dto;

/** The Kafka message published when an async analysis is requested. */
public class AnalyzeJobRequestedEvent {

    private String jobId;
    private String username;
    private String owner;
    private String repo;
    private String token;
    private int limit;

    public AnalyzeJobRequestedEvent() {
    }

    public AnalyzeJobRequestedEvent(String jobId, String username, String owner, String repo, String token, int limit) {
        this.jobId = jobId;
        this.username = username;
        this.owner = owner;
        this.repo = repo;
        this.token = token;
        this.limit = limit;
    }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getRepo() { return repo; }
    public void setRepo(String repo) { this.repo = repo; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public int getLimit() { return limit; }
    public void setLimit(int limit) { this.limit = limit; }
}
