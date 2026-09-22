package com.candor.service;

import com.candor.dto.ReviewType;
import com.candor.dto.github.GitHubReview;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Decides whether a PR's review comments were substantive or superficial.
 *
 * Two factors genuinely affect the outcome:
 * - Length: anything under SHORT_COMMENT_THRESHOLD characters is too brief to
 *   contain real feedback, regardless of wording.
 * - Keyword content: even a longer comment is still superficial if it's
 *   essentially just generic approval phrases strung together.
 */
@Service
public class CommentClassifier {

    private static final int SHORT_COMMENT_THRESHOLD = 25; // characters
    private static final int RESIDUAL_CONTENT_THRESHOLD = 12; // characters of "real" content required after stripping stock phrases

    private static final Set<String> STOCK_PHRASES = Set.of(
            "lgtm", "looks good", "looks good to me", "+1", "nice",
            "nice work", "good job", "ok", "okay", "approved", "great", "good"
    );

    private static final List<String> STOCK_PHRASES_BY_LENGTH_DESC = STOCK_PHRASES.stream()
            .sorted((a, b) -> b.length() - a.length())
            .toList();

    public ReviewType classify(List<GitHubReview> reviews) {
        return classifySingle(pickBestReview(reviews).map(GitHubReview::getBody).orElse(null));
    }

    public Optional<GitHubReview> pickBestReview(List<GitHubReview> reviews) {
        return reviews.stream()
                .filter(r -> r.getBody() != null && !r.getBody().isBlank())
                .reduce((first, second) -> second.getBody().length() > first.getBody().length() ? second : first);
    }

    public String reasonFor(ReviewType type) {
        return switch (type) {
            case NONE -> "No review comment was left before this pull request was merged.";
            case SUPERFICIAL -> "The comment is brief (under " + SHORT_COMMENT_THRESHOLD
                    + " characters) and reads like generic approval language (e.g. \"LGTM\", \"+1\", \"looks good\") "
                    + "without referencing a specific file, line, or concern.";
            case SUBSTANTIVE -> "The comment is longer than a brief acknowledgement, which this tool treats as a "
                    + "signal of real engagement with the change - though length alone can't confirm the reviewer "
                    + "actually caught every issue.";
        };
    }

    public ReviewType classifySingle(String commentBody) {
        if (commentBody == null || commentBody.isBlank()) {
            return ReviewType.NONE;
        }

        String normalized = commentBody.trim().toLowerCase();

        if (normalized.length() < SHORT_COMMENT_THRESHOLD) {
            return ReviewType.SUPERFICIAL;
        }

        if (isMostlyStockPhrases(normalized)) {
            return ReviewType.SUPERFICIAL;
        }

        return ReviewType.SUBSTANTIVE;
    }

    private boolean isMostlyStockPhrases(String normalized) {
        String residual = normalized;
        for (String phrase : STOCK_PHRASES_BY_LENGTH_DESC) {
            residual = residual.replace(phrase, "");
        }
        residual = residual.replaceAll("[^a-z0-9]", "");
        return residual.length() < RESIDUAL_CONTENT_THRESHOLD;
    }

    public String snippetOf(List<GitHubReview> reviews) {
        return reviews.stream()
                .map(GitHubReview::getBody)
                .filter(body -> body != null && !body.isBlank())
                .findFirst()
                .map(body -> body.length() > 140 ? body.substring(0, 140) + "..." : body)
                .orElse("(no review comment)");
    }

    public List<ReviewerEntry> classifyByReviewer(List<GitHubReview> reviews) {
        return reviews.stream()
                .filter(r -> r.getBody() != null && !r.getBody().isBlank())
                .map(r -> new ReviewerEntry(r.getReviewerLogin(), classifySingle(r.getBody())))
                .toList();
    }

    public record ReviewerEntry(String reviewer, ReviewType type) {
    }
}
