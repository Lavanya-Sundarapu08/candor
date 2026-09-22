package com.candor.service;

import com.candor.dto.AnalysisResponseDto;
import com.candor.dto.AnalyzeJobRequestedEvent;
import com.candor.dto.AnalyzeJobStatusDto;
import com.candor.dto.AnalyzeRequest;
import com.candor.entity.AnalysisJob;
import com.candor.exception.JobNotFoundException;
import com.candor.repository.AnalysisJobRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

/**
 * The async analysis pipeline: submitJob() publishes a Kafka event and
 * returns immediately; handleAnalyzeRequested() runs on the Kafka consumer
 * thread and does the actual GitHub fetch/classify/correlate work, reusing
 * the exact same AnalysisService the synchronous /api/analyze endpoint uses -
 * this is additive, not a replacement for that endpoint.
 */
@Service
public class AnalysisJobService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisJobService.class);

    private final AnalysisJobRepository jobRepository;
    private final AnalysisService analysisService;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String topicName;

    @Value("${spring.kafka.listener.auto-startup:true}")
    private boolean kafkaListenerActive;

    public AnalysisJobService(AnalysisJobRepository jobRepository, AnalysisService analysisService,
                               KafkaTemplate<String, Object> kafkaTemplate, ObjectMapper objectMapper,
                               @Value("${candor.kafka.analyze-topic}") String topicName) {
        this.jobRepository = jobRepository;
        this.analysisService = analysisService;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.topicName = topicName;
    }

    public String submitJob(AnalyzeRequest request, String username) {
        String jobId = UUID.randomUUID().toString();

        AnalysisJob job = new AnalysisJob();
        job.setJobId(jobId);
        job.setUsername(username);
        job.setOwner(request.getOwner());
        job.setRepo(request.getRepo());
        job.setStatus(AnalysisJob.JobStatus.PENDING);
        job.setCreatedAt(Instant.now());
        jobRepository.save(job);

        AnalyzeJobRequestedEvent event = new AnalyzeJobRequestedEvent(
                jobId, username, request.getOwner(), request.getRepo(), request.getToken(), request.getLimit());

        if (kafkaListenerActive) {
            try {
                kafkaTemplate.send(topicName, jobId, event);
            } catch (Exception ex) {
                log.warn("Kafka send failed ({}), processing job asynchronously in background", ex.getMessage());
                java.util.concurrent.CompletableFuture.runAsync(() -> handleAnalyzeRequested(event));
            }
        } else {
            log.info("Kafka listener disabled locally, running job {} in background executor", jobId);
            java.util.concurrent.CompletableFuture.runAsync(() -> handleAnalyzeRequested(event));
        }

        return jobId;
    }

    @KafkaListener(topics = "${candor.kafka.analyze-topic}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleAnalyzeRequested(AnalyzeJobRequestedEvent event) {
        AnalysisJob job = jobRepository.findById(event.getJobId()).orElse(null);
        if (job == null) {
            log.warn("Received Kafka event for unknown job {}", event.getJobId());
            return;
        }

        job.setStatus(AnalysisJob.JobStatus.RUNNING);
        jobRepository.save(job);

        try {
            AnalyzeRequest request = new AnalyzeRequest();
            request.setOwner(event.getOwner());
            request.setRepo(event.getRepo());
            request.setToken(event.getToken());
            request.setLimit(event.getLimit());

            AnalysisResponseDto result = analysisService.analyze(request, event.getUsername());

            job.setResultJson(objectMapper.writeValueAsString(result));
            job.setStatus(AnalysisJob.JobStatus.COMPLETED);
        } catch (Exception ex) {
            log.error("Async analysis failed for job {}", event.getJobId(), ex);
            job.setStatus(AnalysisJob.JobStatus.FAILED);
            job.setErrorMessage(ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName());
        } finally {
            job.setCompletedAt(Instant.now());
            jobRepository.save(job);
        }
    }

    public AnalyzeJobStatusDto getStatus(String jobId, String username) {
        AnalysisJob job = jobRepository.findById(jobId)
                .filter(j -> j.getUsername().equals(username))
                .orElseThrow(() -> new JobNotFoundException("Job not found: " + jobId));

        AnalysisResponseDto result = null;
        if (job.getStatus() == AnalysisJob.JobStatus.COMPLETED && job.getResultJson() != null) {
            try {
                result = objectMapper.readValue(job.getResultJson(), AnalysisResponseDto.class);
            } catch (Exception ex) {
                log.error("Failed to deserialize stored result for job {}", jobId, ex);
            }
        }

        return new AnalyzeJobStatusDto(job.getJobId(), job.getStatus().name(), result, job.getErrorMessage());
    }
}
