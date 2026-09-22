package com.candor.entity;

import com.candor.dto.ReviewType;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "analyzed_pull_request",
        uniqueConstraints = @UniqueConstraint(columnNames = {"repoFullName", "prNumber", "username"}))
public class AnalyzedPullRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String repoFullName;
    private int prNumber;
    private String title;
    private String author;
    private String mergedAt;
    private String url;

    @Enumerated(EnumType.STRING)
    private ReviewType reviewType;

    @Column(length = 1000)
    private String reviewSnippet;

    @ElementCollection
    @CollectionTable(name = "analyzed_pr_files", joinColumns = @JoinColumn(name = "pr_id"))
    @Column(name = "filename")
    private List<String> filesChanged;

    private boolean hadFollowUpFix;

    @ElementCollection
    @CollectionTable(name = "analyzed_pr_followup_commits", joinColumns = @JoinColumn(name = "pr_id"))
    @Column(name = "commit_message", length = 500)
    private List<String> followUpCommitMessages;

    private Instant analyzedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRepoFullName() { return repoFullName; }
    public void setRepoFullName(String repoFullName) { this.repoFullName = repoFullName; }

    public int getPrNumber() { return prNumber; }
    public void setPrNumber(int prNumber) { this.prNumber = prNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getMergedAt() { return mergedAt; }
    public void setMergedAt(String mergedAt) { this.mergedAt = mergedAt; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public ReviewType getReviewType() { return reviewType; }
    public void setReviewType(ReviewType reviewType) { this.reviewType = reviewType; }

    public String getReviewSnippet() { return reviewSnippet; }
    public void setReviewSnippet(String reviewSnippet) { this.reviewSnippet = reviewSnippet; }

    public List<String> getFilesChanged() { return filesChanged; }
    public void setFilesChanged(List<String> filesChanged) { this.filesChanged = filesChanged; }

    public boolean isHadFollowUpFix() { return hadFollowUpFix; }
    public void setHadFollowUpFix(boolean hadFollowUpFix) { this.hadFollowUpFix = hadFollowUpFix; }

    public List<String> getFollowUpCommitMessages() { return followUpCommitMessages; }
    public void setFollowUpCommitMessages(List<String> followUpCommitMessages) { this.followUpCommitMessages = followUpCommitMessages; }

    public Instant getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(Instant analyzedAt) { this.analyzedAt = analyzedAt; }
}
