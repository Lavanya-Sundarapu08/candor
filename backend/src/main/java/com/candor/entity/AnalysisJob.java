package com.candor.entity;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * Tracks one async analysis request submitted through the Kafka pipeline.
 * The full AnalysisResponseDto is stored as JSON once the job completes,
 * rather than re-deriving it from AnalyzedPullRequest rows, to keep the
 * async path self-contained and simple to reason about.
 */
@Entity
@Table(name = "analysis_job")
public class AnalysisJob {

    @Id
    private String jobId;

    private String username;
    private String owner;
    private String repo;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    @Column(columnDefinition = "TEXT")
    private String resultJson;

    @Column(length = 1000)
    private String errorMessage;

    private Instant createdAt;
    private Instant completedAt;

    public enum JobStatus { PENDING, RUNNING, COMPLETED, FAILED }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getRepo() { return repo; }
    public void setRepo(String repo) { this.repo = repo; }

    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }

    public String getResultJson() { return resultJson; }
    public void setResultJson(String resultJson) { this.resultJson = resultJson; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}
