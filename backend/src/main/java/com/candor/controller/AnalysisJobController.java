package com.candor.controller;

import com.candor.dto.AnalyzeJobStatusDto;
import com.candor.dto.AnalyzeRequest;
import com.candor.dto.JobSubmittedDto;
import com.candor.service.AnalysisJobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * Async analysis pipeline via Kafka. Additive alongside the existing
 * synchronous /api/analyze endpoint in AnalysisController - this is the path
 * used for the "run analysis" flow going forward, but the synchronous one
 * still works unchanged.
 */
@RestController
@RequestMapping("/api/analyze/async")
public class AnalysisJobController {

    private final AnalysisJobService jobService;

    public AnalysisJobController(AnalysisJobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public JobSubmittedDto submit(@Valid @RequestBody AnalyzeRequest request, Principal principal) {
        String jobId = jobService.submitJob(request, principal.getName());
        return new JobSubmittedDto(jobId);
    }

    @GetMapping("/{jobId}")
    public AnalyzeJobStatusDto status(@PathVariable String jobId, Principal principal) {
        return jobService.getStatus(jobId, principal.getName());
    }
}
