package com.candor.dto;

import java.util.List;

public class AnalysisSummaryDto {

    private String repo;
    private int totalAnalyzed;
    private int substantiveCount;
    private int superficialCount;
    private int noReviewCount;
    private int reviewedCount;
    private int followUpFixCount;
    private int riskyApprovalCount;
    private Double superficialRatePercent; // null (not 0) when reviewedCount is 0 - "not enough data" vs "checked, found none"
    private double followUpFixRatePercent;
    private double riskyApprovalRatePercent;
    private List<String> insights;
    private List<ReviewerStatDto> reviewerLeaderboard;

    public String getRepo() { return repo; }
    public void setRepo(String repo) { this.repo = repo; }

    public int getTotalAnalyzed() { return totalAnalyzed; }
    public void setTotalAnalyzed(int totalAnalyzed) { this.totalAnalyzed = totalAnalyzed; }

    public int getSubstantiveCount() { return substantiveCount; }
    public void setSubstantiveCount(int substantiveCount) { this.substantiveCount = substantiveCount; }

    public int getSuperficialCount() { return superficialCount; }
    public void setSuperficialCount(int superficialCount) { this.superficialCount = superficialCount; }

    public int getNoReviewCount() { return noReviewCount; }
    public void setNoReviewCount(int noReviewCount) { this.noReviewCount = noReviewCount; }

    public int getReviewedCount() { return reviewedCount; }
    public void setReviewedCount(int reviewedCount) { this.reviewedCount = reviewedCount; }

    public int getFollowUpFixCount() { return followUpFixCount; }
    public void setFollowUpFixCount(int followUpFixCount) { this.followUpFixCount = followUpFixCount; }

    public int getRiskyApprovalCount() { return riskyApprovalCount; }
    public void setRiskyApprovalCount(int riskyApprovalCount) { this.riskyApprovalCount = riskyApprovalCount; }

    public Double getSuperficialRatePercent() { return superficialRatePercent; }
    public void setSuperficialRatePercent(Double superficialRatePercent) { this.superficialRatePercent = superficialRatePercent; }

    public double getFollowUpFixRatePercent() { return followUpFixRatePercent; }
    public void setFollowUpFixRatePercent(double followUpFixRatePercent) { this.followUpFixRatePercent = followUpFixRatePercent; }

    public double getRiskyApprovalRatePercent() { return riskyApprovalRatePercent; }
    public void setRiskyApprovalRatePercent(double riskyApprovalRatePercent) { this.riskyApprovalRatePercent = riskyApprovalRatePercent; }

    public List<String> getInsights() { return insights; }
    public void setInsights(List<String> insights) { this.insights = insights; }

    public List<ReviewerStatDto> getReviewerLeaderboard() { return reviewerLeaderboard; }
    public void setReviewerLeaderboard(List<ReviewerStatDto> reviewerLeaderboard) { this.reviewerLeaderboard = reviewerLeaderboard; }
}
