package com.candor.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class AnalyzeRequest {

    @NotBlank(message = "owner is required")
    private String owner;

    @NotBlank(message = "repo is required")
    private String repo;

    private String token;

    @Min(1)
    @Max(30)
    private int limit = 10;

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getRepo() { return repo; }
    public void setRepo(String repo) { this.repo = repo; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public int getLimit() { return limit; }
    public void setLimit(int limit) { this.limit = limit; }
}
