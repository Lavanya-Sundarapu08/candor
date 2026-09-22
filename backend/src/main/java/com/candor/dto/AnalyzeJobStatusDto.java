package com.candor.dto;

public class AnalyzeJobStatusDto {

    private String jobId;
    private String status;
    private AnalysisResponseDto result;
    private String errorMessage;

    public AnalyzeJobStatusDto(String jobId, String status, AnalysisResponseDto result, String errorMessage) {
        this.jobId = jobId;
        this.status = status;
        this.result = result;
        this.errorMessage = errorMessage;
    }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public AnalysisResponseDto getResult() { return result; }
    public void setResult(AnalysisResponseDto result) { this.result = result; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
