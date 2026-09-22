package com.candor.controller;

import com.candor.dto.AIInsightRequest;
import com.candor.dto.AIInsightResponseDto;
import com.candor.service.AIInsightService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai-insight")
public class AIInsightController {

    private final AIInsightService aiInsightService;

    public AIInsightController(AIInsightService aiInsightService) {
        this.aiInsightService = aiInsightService;
    }

    @PostMapping("/pr")
    public AIInsightResponseDto generate(@Valid @RequestBody AIInsightRequest request) {
        String interpretation = aiInsightService.generateInterpretation(request);
        return new AIInsightResponseDto(interpretation);
    }
}
