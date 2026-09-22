package com.candor.dto;

import java.util.List;

public class AnalysisResponseDto {

    private AnalysisSummaryDto summary;
    private List<PullRequestAnalysisDto> pullRequests;

    public AnalysisResponseDto() {
    }

    public AnalysisResponseDto(AnalysisSummaryDto summary, List<PullRequestAnalysisDto> pullRequests) {
        this.summary = summary;
        this.pullRequests = pullRequests;
    }

    public AnalysisSummaryDto getSummary() { return summary; }
    public void setSummary(AnalysisSummaryDto summary) { this.summary = summary; }

    public List<PullRequestAnalysisDto> getPullRequests() { return pullRequests; }
    public void setPullRequests(List<PullRequestAnalysisDto> pullRequests) { this.pullRequests = pullRequests; }
}
