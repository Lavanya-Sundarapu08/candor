package com.candor.service;

import com.candor.dto.*;
import com.candor.dto.github.GitHubFile;
import com.candor.dto.github.GitHubPullRequest;
import com.candor.dto.github.GitHubReview;
import com.candor.entity.AnalyzedPullRequest;
import com.candor.repository.AnalyzedPullRequestRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalysisService {

    private final GitHubClient gitHubClient;
    private final CommentClassifier commentClassifier;
    private final FollowUpFixDetector followUpFixDetector;
    private final InsightService insightService;
    private final AnalyzedPullRequestRepository repository;

    public AnalysisService(GitHubClient gitHubClient, CommentClassifier commentClassifier,
                            FollowUpFixDetector followUpFixDetector, InsightService insightService,
                            AnalyzedPullRequestRepository repository) {
        this.gitHubClient = gitHubClient;
        this.commentClassifier = commentClassifier;
        this.followUpFixDetector = followUpFixDetector;
        this.insightService = insightService;
        this.repository = repository;
    }

    public AnalysisResponseDto analyze(AnalyzeRequest request, String username) {
        String repoFullName = request.getOwner() + "/" + request.getRepo();

        List<GitHubPullRequest> pullRequests = gitHubClient.fetchClosedPullRequests(
                request.getOwner(), request.getRepo(), request.getToken(), request.getLimit());

        List<PullRequestAnalysisDto> results = new ArrayList<>();
        List<ReviewerRawSignal> allReviewerSignals = new ArrayList<>();

        for (GitHubPullRequest pr : pullRequests) {
            if (!pr.isMerged() || results.size() >= request.getLimit()) {
                continue;
            }
            results.add(analyzeOnePullRequest(request, repoFullName, pr, allReviewerSignals, username));
        }

        AnalysisSummaryDto summary = buildSummary(repoFullName, results, allReviewerSignals);
        return new AnalysisResponseDto(summary, results);
    }

    private PullRequestAnalysisDto analyzeOnePullRequest(AnalyzeRequest request, String repoFullName,
                                                           GitHubPullRequest pr,
                                                           List<ReviewerRawSignal> reviewerSignalAccumulator,
                                                           String username) {
        List<GitHubReview> reviews = gitHubClient.fetchReviews(
                request.getOwner(), request.getRepo(), pr.getNumber(), request.getToken());
        ReviewType reviewType = commentClassifier.classify(reviews);
        String snippet = commentClassifier.snippetOf(reviews);
        String reason = commentClassifier.reasonFor(reviewType);
        String reviewSubmittedAt = commentClassifier.pickBestReview(reviews)
                .map(GitHubReview::getSubmittedAt).orElse(null);

        List<GitHubFile> files = gitHubClient.fetchFiles(
                request.getOwner(), request.getRepo(), pr.getNumber(), request.getToken());
        List<String> filenames = new ArrayList<>(files.stream().map(GitHubFile::getFilename).toList());

        Instant mergedAt = Instant.parse(pr.getMergedAt());
        List<FollowUpFixEvidenceDto> followUpFixes = followUpFixDetector.findFollowUpFixEvidence(
                request.getOwner(), request.getRepo(), files, mergedAt, request.getToken());
        boolean hadFollowUpFix = !followUpFixes.isEmpty();

        for (CommentClassifier.ReviewerEntry entry : commentClassifier.classifyByReviewer(reviews)) {
            reviewerSignalAccumulator.add(new ReviewerRawSignal(entry.reviewer(), entry.type(), hadFollowUpFix));
        }

        PullRequestAnalysisDto dto = new PullRequestAnalysisDto(
                pr.getNumber(), pr.getTitle(),
                pr.getUser() != null ? pr.getUser().getLogin() : "unknown",
                pr.getCreatedAt(), pr.getMergedAt(), pr.getHtmlUrl(), reviewType, snippet, reason,
                reviewSubmittedAt, filenames, hadFollowUpFix, followUpFixes);

        persist(repoFullName, dto, username);
        return dto;
    }

    private void persist(String repoFullName, PullRequestAnalysisDto dto, String username) {
        AnalyzedPullRequest entity = repository
                .findByUsernameAndRepoFullNameAndPrNumber(username, repoFullName, dto.getPrNumber())
                .orElseGet(AnalyzedPullRequest::new);

        entity.setUsername(username);
        entity.setRepoFullName(repoFullName);
        entity.setPrNumber(dto.getPrNumber());
        entity.setTitle(dto.getTitle());
        entity.setAuthor(dto.getAuthor());
        entity.setMergedAt(dto.getMergedAt());
        entity.setUrl(dto.getUrl());
        entity.setReviewType(dto.getReviewType());
        entity.setReviewSnippet(dto.getReviewSnippet());
        entity.setFilesChanged(new ArrayList<>(dto.getFilesChanged()));
        entity.setHadFollowUpFix(dto.isHadFollowUpFix());
        entity.setFollowUpCommitMessages(new ArrayList<>(
                dto.getFollowUpFixes().stream().map(FollowUpFixEvidenceDto::getCommitMessage).toList()));
        entity.setAnalyzedAt(Instant.now());

        repository.save(entity);
    }

    private AnalysisSummaryDto buildSummary(String repoFullName, List<PullRequestAnalysisDto> results,
                                             List<ReviewerRawSignal> reviewerSignals) {
        AnalysisSummaryDto summary = new AnalysisSummaryDto();
        summary.setRepo(repoFullName);
        summary.setTotalAnalyzed(results.size());

        int substantive = 0, superficial = 0, none = 0, followUp = 0, risky = 0;
        for (PullRequestAnalysisDto dto : results) {
            switch (dto.getReviewType()) {
                case SUBSTANTIVE -> substantive++;
                case SUPERFICIAL -> superficial++;
                case NONE -> none++;
            }
            if (dto.isHadFollowUpFix()) {
                followUp++;
            }
            if (dto.isRiskyApproval()) {
                risky++;
            }
        }

        int reviewedCount = substantive + superficial;

        summary.setSubstantiveCount(substantive);
        summary.setSuperficialCount(superficial);
        summary.setNoReviewCount(none);
        summary.setReviewedCount(reviewedCount);
        summary.setFollowUpFixCount(followUp);
        summary.setRiskyApprovalCount(risky);

        int total = results.size();
        // Null (not 0.0) when nothing was reviewed - "not enough data" vs "checked, found none".
        summary.setSuperficialRatePercent(reviewedCount == 0 ? null : (superficial * 100.0) / reviewedCount);
        summary.setFollowUpFixRatePercent(total == 0 ? 0 : (followUp * 100.0) / total);
        summary.setRiskyApprovalRatePercent(total == 0 ? 0 : (risky * 100.0) / total);

        summary.setInsights(insightService.generate(summary));
        summary.setReviewerLeaderboard(buildLeaderboard(reviewerSignals));
        return summary;
    }

    private List<ReviewerStatDto> buildLeaderboard(List<ReviewerRawSignal> reviewerSignals) {
        Map<String, int[]> counts = new LinkedHashMap<>();
        for (ReviewerRawSignal signal : reviewerSignals) {
            int[] tally = counts.computeIfAbsent(signal.reviewer(), k -> new int[3]);
            if (signal.type() == ReviewType.SUBSTANTIVE) {
                tally[0]++;
            } else if (signal.type() == ReviewType.SUPERFICIAL) {
                tally[1]++;
            }
            if (signal.hadFollowUpFix()) {
                tally[2]++;
            }
        }

        return counts.entrySet().stream()
                .map(e -> new ReviewerStatDto(e.getKey(), e.getValue()[0], e.getValue()[1], e.getValue()[2]))
                .sorted(Comparator.comparingInt(ReviewerStatDto::getScore).reversed())
                .toList();
    }

    private record ReviewerRawSignal(String reviewer, ReviewType type, boolean hadFollowUpFix) {
    }

    public List<AnalyzedPullRequest> history(String owner, String repo, String username) {
        return repository.findByUsernameAndRepoFullNameOrderByPrNumberDesc(username, owner + "/" + repo);
    }
}
