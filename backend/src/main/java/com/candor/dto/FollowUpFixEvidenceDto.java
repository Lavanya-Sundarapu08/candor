package com.candor.dto;

public class FollowUpFixEvidenceDto {

    private String commitMessage;
    private String file;
    private String matchedKeyword;
    private String commitDate;
    private String timeAfterMerge;

    public FollowUpFixEvidenceDto() {
    }

    public FollowUpFixEvidenceDto(String commitMessage, String file, String matchedKeyword,
                                   String commitDate, String timeAfterMerge) {
        this.commitMessage = commitMessage;
        this.file = file;
        this.matchedKeyword = matchedKeyword;
        this.commitDate = commitDate;
        this.timeAfterMerge = timeAfterMerge;
    }

    public String getCommitMessage() { return commitMessage; }
    public void setCommitMessage(String commitMessage) { this.commitMessage = commitMessage; }

    public String getFile() { return file; }
    public void setFile(String file) { this.file = file; }

    public String getMatchedKeyword() { return matchedKeyword; }
    public void setMatchedKeyword(String matchedKeyword) { this.matchedKeyword = matchedKeyword; }

    public String getCommitDate() { return commitDate; }
    public void setCommitDate(String commitDate) { this.commitDate = commitDate; }

    public String getTimeAfterMerge() { return timeAfterMerge; }
    public void setTimeAfterMerge(String timeAfterMerge) { this.timeAfterMerge = timeAfterMerge; }
}
