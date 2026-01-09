package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

@Data
public class FullAnalysisResponse {
    private String machineName;

    private MachineAnalysisResponse fuzzyResult;

    private Double totalCost;
    private Double calculatedDays;
    private Boolean isDeadlineMet;
    private String costDetails;
}