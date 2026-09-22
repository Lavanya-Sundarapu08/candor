package com.candor.service;

import com.candor.dto.ReviewType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class CommentClassifierTest {

    private final CommentClassifier classifier = new CommentClassifier();

    @Test
    @DisplayName("\"LGTM\" is classified as superficial")
    void lgtmIsClassifiedAsSuperficial() {
        ReviewType result = classifier.classifySingle("LGTM");

        assertThat(result).isEqualTo(ReviewType.SUPERFICIAL);
        assertThat(classifier.reasonFor(result))
                .contains("brief")
                .contains("generic approval language");
    }

    @Test
    @DisplayName("\"Looks good to me\" is classified as superficial")
    void looksGoodToMeIsClassifiedAsSuperficial() {
        ReviewType result = classifier.classifySingle("Looks good to me!");

        assertThat(result).isEqualTo(ReviewType.SUPERFICIAL);
    }

    @Test
    @DisplayName("A detailed, actionable comment is classified as substantive")
    void detailedActionableCommentIsClassifiedAsSubstantive() {
        String comment = "The retry logic doesn't cap the number of attempts - can you add a max "
                + "retry limit before this ships, otherwise a failing downstream call could loop forever?";

        ReviewType result = classifier.classifySingle(comment);

        assertThat(result).isEqualTo(ReviewType.SUBSTANTIVE);
        assertThat(classifier.reasonFor(result)).contains("signal of real engagement");
    }

    @Test
    @DisplayName("A long comment that is mostly strung-together stock phrases is still superficial")
    void longCommentThatIsMostlyStockPhrasesIsStillSuperficial() {
        String comment = "Looks good to me, nice work! Approved, great job overall!!";

        ReviewType result = classifier.classifySingle(comment);

        assertThat(result)
                .as("length alone would wrongly call this substantive - keyword stripping should catch it")
                .isEqualTo(ReviewType.SUPERFICIAL);
    }

    @ParameterizedTest(name = "commentBody=\"{0}\" is classified as NONE")
    @NullAndEmptySource
    @ValueSource(strings = {"   ", "\n\t"})
    @DisplayName("Null, empty, or whitespace-only comments are classified as NONE")
    void nullOrBlankCommentIsClassifiedAsNone(String commentBody) {
        ReviewType result = classifier.classifySingle(commentBody);

        assertThat(result).isEqualTo(ReviewType.NONE);
        assertThat(classifier.reasonFor(result)).contains("No review comment was left");
    }
}
