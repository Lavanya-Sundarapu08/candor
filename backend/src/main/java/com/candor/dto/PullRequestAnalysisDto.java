package com.candor.dto;

import java.util.List;

public class PullRequestAnalysisDto {

    private int prNumber;
    private String title;
    private String author;
    private String prCreatedAt;
    private String mergedAt;
    private String url;
    private ReviewType reviewType;
    private String reviewSnippet;
    private String classificationReason;
    private String reviewSubmittedAt;
    private List<String> filesChanged;
    private boolean hadFollowUpFix;
    private List<FollowUpFixEvidenceDto> followUpFixes;

    public PullRequestAnalysisDto() {
    }

    public PullRequestAnalysisDto(int prNumber, String title, String author, String prCreatedAt, String mergedAt,
                                   String url, ReviewType reviewType, String reviewSnippet, String classificationReason,
                                   String reviewSubmittedAt, List<String> filesChanged, boolean hadFollowUpFix,
                                   List<FollowUpFixEvidenceDto> followUpFixes) {
        this.prNumber = prNumber;
        this.title = title;
        this.author = author;
        this.prCreatedAt = prCreatedAt;
        this.mergedAt = mergedAt;
        this.url = url;
        this.reviewType = reviewType;
        this.reviewSnippet = reviewSnippet;
        this.classificationReason = classificationReason;
        this.reviewSubmittedAt = reviewSubmittedAt;
        this.filesChanged = filesChanged;
        this.hadFollowUpFix = hadFollowUpFix;
        this.followUpFixes = followUpFixes;
    }

    public boolean isRiskyApproval() {
        return reviewType == ReviewType.SUPERFICIAL && hadFollowUpFix;
    }

    public int getPrNumber() { return prNumber; }
    public void setPrNumber(int prNumber) { this.prNumber = prNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getPrCreatedAt() { return prCreatedAt; }
    public void setPrCreatedAt(String prCreatedAt) { this.prCreatedAt = prCreatedAt; }

    public String getMergedAt() { return mergedAt; }
    public void setMergedAt(String mergedAt) { this.mergedAt = mergedAt; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public ReviewType getReviewType() { return reviewType; }
    public void setReviewType(ReviewType reviewType) { this.reviewType = reviewType; }

    public String getReviewSnippet() { return reviewSnippet; }
    public void setReviewSnippet(String reviewSnippet) { this.reviewSnippet = reviewSnippet; }

    public String getClassificationReason() { return classificationReason; }
    public void setClassificationReason(String classificationReason) { this.classificationReason = classificationReason; }

    public String getReviewSubmittedAt() { return reviewSubmittedAt; }
    public void setReviewSubmittedAt(String reviewSubmittedAt) { this.reviewSubmittedAt = reviewSubmittedAt; }

    public List<String> getFilesChanged() { return filesChanged; }
    public void setFilesChanged(List<String> filesChanged) { this.filesChanged = filesChanged; }

    public boolean isHadFollowUpFix() { return hadFollowUpFix; }
    public void setHadFollowUpFix(boolean hadFollowUpFix) { this.hadFollowUpFix = hadFollowUpFix; }

    public List<FollowUpFixEvidenceDto> getFollowUpFixes() { return followUpFixes; }
    public void setFollowUpFixes(List<FollowUpFixEvidenceDto> followUpFixes) { this.followUpFixes = followUpFixes; }
}
