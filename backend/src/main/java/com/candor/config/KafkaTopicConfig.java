package com.candor.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic analyzeRequestsTopic(@Value("${candor.kafka.analyze-topic}") String topicName) {
        // Single partition/replica is intentional for local dev - a real
        // multi-broker deployment would raise both for throughput and durability.
        return TopicBuilder.name(topicName)
                .partitions(1)
                .replicas(1)
                .build();
    }
}
