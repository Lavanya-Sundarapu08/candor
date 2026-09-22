package com.candor.service;

import com.candor.dto.AIInsightRequest;
import com.candor.exception.AIServiceException;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Generates a plain-language "AI Interpretation" for a flagged PR, using
 * only the structured evidence already computed by the deterministic rule
 * engine - never raw PR content. The prompt explicitly forbids inventing
 * facts, assigning confidence scores, or claiming the review caused the
 * follow-up fix. This output is always labeled "AI Interpretation" in the
 * UI and kept visually separate from Observed/Classified/Signal.
 */
@Service
public class AIInsightService {

    private final ChatClient chatClient;

    public AIInsightService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String generateInterpretation(AIInsightRequest request) {
        String prompt = buildPrompt(request);
        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
            return response != null ? response.trim() : "The AI service returned an empty response.";
        } catch (Exception ex) {
            throw new AIServiceException(
                    "AI service unavailable - is Ollama running locally with the configured model pulled? "
                            + "(" + ex.getMessage() + ")", ex);
        }
    }

    private String buildPrompt(AIInsightRequest request) {
        StringBuilder evidence = new StringBuilder();
        evidence.append("PR #").append(request.getPrNumber()).append(": ").append(request.getPrTitle()).append("\n");
        evidence.append("Review comment: \"").append(nullSafe(request.getReviewSnippet())).append("\"\n");
        evidence.append("Classification: ").append(request.getReviewType()).append("\n");
        evidence.append("Classification reason: ").append(nullSafe(request.getClassificationReason())).append("\n");
        evidence.append("Follow-up fix activity detected: ").append(request.isHadFollowUpFix() ? "yes" : "no").append("\n");

        List<String> followUps = request.getFollowUpSummaries();
        if (followUps != null && !followUps.isEmpty()) {
            evidence.append("Follow-up fix details:\n");
            for (String summary : followUps) {
                evidence.append("- ").append(summary).append("\n");
            }
        }

        return """
                You are given ONLY the structured evidence below about a GitHub pull request review.
                Do not invent any facts not present in this evidence. Do not assign a confidence
                percentage. Do not claim the review caused, missed, or failed to catch a bug - only
                describe what the evidence shows and, if relevant, why it might be worth a human
                investigating further. Keep your answer to 2-3 plain sentences.

                Evidence:
                %s
                """.formatted(evidence);
    }

    private String nullSafe(String value) {
        return value == null ? "(none)" : value;
    }
}
