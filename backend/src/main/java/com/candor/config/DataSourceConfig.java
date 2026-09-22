package com.candor.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username:postgres}")
    private String configuredUsername;

    @Value("${spring.datasource.password:database}")
    private String configuredPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String jdbcUrl = rawUrl != null ? rawUrl.trim() : "";
        String username = configuredUsername;
        String password = configuredPassword;

        // Automatically convert standard cloud postgresql:// or postgres:// URI into valid JDBC format
        if (jdbcUrl.startsWith("postgresql://") || jdbcUrl.startsWith("postgres://")) {
            try {
                URI uri = URI.create(jdbcUrl);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = (uri.getPath() != null && !uri.getPath().isBlank()) ? uri.getPath() : "/neondb";

                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + "?sslmode=require";
                log.info("Auto-configured cloud PostgreSQL connection for host: {}", host);
            } catch (Exception e) {
                log.warn("Failed to parse PostgreSQL URI, prefixing jdbc: directly", e);
                jdbcUrl = "jdbc:" + jdbcUrl;
            }
        } else if (!jdbcUrl.startsWith("jdbc:")) {
            jdbcUrl = "jdbc:" + jdbcUrl;
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        if (username != null && !username.isBlank()) {
            config.setUsername(username);
        }
        if (password != null && !password.isBlank()) {
            config.setPassword(password);
        }
        config.setDriverClassName("org.postgresql.Driver");
        return new HikariDataSource(config);
    }
}
