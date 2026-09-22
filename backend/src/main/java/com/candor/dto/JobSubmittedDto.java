package com.candor.dto;

public class JobSubmittedDto {
    private String jobId;

    public JobSubmittedDto(String jobId) {
        this.jobId = jobId;
    }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
}
