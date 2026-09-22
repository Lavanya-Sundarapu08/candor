package com.candor.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * Structured evidence sent to the AI - deliberately narrow. Only the same
 * facts already shown in the Observed/Classified/Signal evidence panel are
 * included; the model never sees raw PR diffs or anything not already
 * computed by the deterministic rule engine.
 */
public class AIInsightRequest {

    private int prNumber;

    @NotBlank
    private String prTitle;

    private String reviewSnippet;

    @NotBlank
    private String reviewType;

    private String classificationReason;
    private boolean hadFollowUpFix;
    private List<String> followUpSummaries;

    public int getPrNumber() { return prNumber; }
    public void setPrNumber(int prNumber) { this.prNumber = prNumber; }

    public String getPrTitle() { return prTitle; }
    public void setPrTitle(String prTitle) { this.prTitle = prTitle; }

    public String getReviewSnippet() { return reviewSnippet; }
    public void setReviewSnippet(String reviewSnippet) { this.reviewSnippet = reviewSnippet; }

    public String getReviewType() { return reviewType; }
    public void setReviewType(String reviewType) { this.reviewType = reviewType; }

    public String getClassificationReason() { return classificationReason; }
    public void setClassificationReason(String classificationReason) { this.classificationReason = classificationReason; }

    public boolean isHadFollowUpFix() { return hadFollowUpFix; }
    public void setHadFollowUpFix(boolean hadFollowUpFix) { this.hadFollowUpFix = hadFollowUpFix; }

    public List<String> getFollowUpSummaries() { return followUpSummaries; }
    public void setFollowUpSummaries(List<String> followUpSummaries) { this.followUpSummaries = followUpSummaries; }
}
