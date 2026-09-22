package com.candor.dto;

public class ReviewerStatDto {

    private String reviewer;
    private int substantiveCount;
    private int superficialCount;
    private int totalReviews;
    private int score;
    private int followUpFixSignalCount;

    public ReviewerStatDto() {
    }

    public ReviewerStatDto(String reviewer, int substantiveCount, int superficialCount, int followUpFixSignalCount) {
        this.reviewer = reviewer;
        this.substantiveCount = substantiveCount;
        this.superficialCount = superficialCount;
        this.totalReviews = substantiveCount + superficialCount;
        this.score = substantiveCount - superficialCount;
        this.followUpFixSignalCount = followUpFixSignalCount;
    }

    public String getReviewer() { return reviewer; }
    public void setReviewer(String reviewer) { this.reviewer = reviewer; }

    public int getSubstantiveCount() { return substantiveCount; }
    public void setSubstantiveCount(int substantiveCount) { this.substantiveCount = substantiveCount; }

    public int getSuperficialCount() { return superficialCount; }
    public void setSuperficialCount(int superficialCount) { this.superficialCount = superficialCount; }

    public int getTotalReviews() { return totalReviews; }
    public void setTotalReviews(int totalReviews) { this.totalReviews = totalReviews; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getFollowUpFixSignalCount() { return followUpFixSignalCount; }
    public void setFollowUpFixSignalCount(int followUpFixSignalCount) { this.followUpFixSignalCount = followUpFixSignalCount; }
}
