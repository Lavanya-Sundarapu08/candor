package com.candor.service;

import com.candor.dto.AnalysisSummaryDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Turns the raw counts in AnalysisSummaryDto into a short list of plain-English
 * observations. Rule-based, not an LLM call - every sentence traces back to a
 * comparison in the code. Distinguishes "0% - evaluated, found none" from
 * "no review data - nothing to evaluate" throughout.
 */
@Service
public class InsightService {

    public List<String> generate(AnalysisSummaryDto summary) {
        List<String> insights = new ArrayList<>();

        if (summary.getTotalAnalyzed() == 0) {
            insights.add("No merged pull requests were found in the analyzed window.");
            return insights;
        }

        int reviewedCount = summary.getReviewedCount();
        int total = summary.getTotalAnalyzed();

        if (reviewedCount == 0) {
            insights.add(String.format(
                    "Analyzed %d merged pull requests. None contained review comments, so review quality "
                            + "could not be evaluated from the available review data.",
                    total));
        } else {
            insights.add(String.format(
                    "Analyzed %d merged pull requests: %d had review comments (%d substantive, %d superficial), %d had none.",
                    total, reviewedCount, summary.getSubstantiveCount(), summary.getSuperficialCount(), summary.getNoReviewCount()));

            double superficialRate = summary.getSuperficialRatePercent() != null ? summary.getSuperficialRatePercent() : 0;
            if (superficialRate >= 50) {
                insights.add(String.format(
                        "%.0f%% of reviewed PRs had a superficial comment - review depth looks like a habit among the PRs that were reviewed, not an exception.",
                        superficialRate));
            } else if (superficialRate >= 20) {
                insights.add(String.format(
                        "%.0f%% of reviewed PRs had a superficial comment - worth spot-checking which reviewers approve fastest.",
                        superficialRate));
            } else {
                insights.add(String.format(
                        "Only %.0f%% of reviewed PRs had a superficial comment - most reviewed approvals came with a real comment.",
                        superficialRate));
            }
        }

        if (summary.getRiskyApprovalCount() > 0) {
            insights.add(String.format(
                    "%d PR(s) were approved with a superficial comment and later showed follow-up fix activity - the clearest case of review theater in this sample.",
                    summary.getRiskyApprovalCount()));
        } else if (summary.getFollowUpFixCount() > 0) {
            insights.add(String.format(
                    "%d of %d PRs (%.0f%%) showed follow-up fix activity after merge. %s",
                    summary.getFollowUpFixCount(), total, summary.getFollowUpFixRatePercent(),
                    reviewedCount == 0
                            ? "Because no review comments were available, Candor cannot determine whether these follow-ups relate to review quality."
                            : "None of these were on PRs with superficial reviews specifically."));
        } else {
            insights.add("No merged PR in this sample showed follow-up fix activity on the same files within the review window.");
        }

        return insights;
    }
}
