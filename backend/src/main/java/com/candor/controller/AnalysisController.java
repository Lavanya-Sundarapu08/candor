package com.candor.controller;

import com.candor.dto.AnalysisResponseDto;
import com.candor.dto.AnalyzeRequest;
import com.candor.entity.AnalyzedPullRequest;
import com.candor.service.AnalysisService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/analyze")
    public AnalysisResponseDto analyze(@Valid @RequestBody AnalyzeRequest request, Principal principal) {
        return analysisService.analyze(request, principal.getName());
    }

    @GetMapping("/history")
    public List<AnalyzedPullRequest> history(@RequestParam String owner, @RequestParam String repo, Principal principal) {
        return analysisService.history(owner, repo, principal.getName());
    }

    @GetMapping("/health")
    public String health() {
        return "ok";
    }
}
