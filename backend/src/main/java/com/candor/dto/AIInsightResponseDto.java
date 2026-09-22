package com.candor.dto;

public class AIInsightResponseDto {
    private String interpretation;

    public AIInsightResponseDto() {
    }

    public AIInsightResponseDto(String interpretation) {
        this.interpretation = interpretation;
    }

    public String getInterpretation() { return interpretation; }
    public void setInterpretation(String interpretation) { this.interpretation = interpretation; }
}
