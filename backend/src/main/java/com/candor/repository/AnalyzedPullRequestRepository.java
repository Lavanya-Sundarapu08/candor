package com.candor.repository;

import com.candor.entity.AnalyzedPullRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnalyzedPullRequestRepository extends JpaRepository<AnalyzedPullRequest, Long> {

    Optional<AnalyzedPullRequest> findByUsernameAndRepoFullNameAndPrNumber(String username, String repoFullName, int prNumber);

    List<AnalyzedPullRequest> findByUsernameAndRepoFullNameOrderByPrNumberDesc(String username, String repoFullName);
}
