package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

import java.util.List;

@Data
public class MachineRecommendationDto {
    private Long machineId;
    private String machineName;
    private double efficiencyScore;
    private double matchScore;
    private boolean withinBudget;
    private double estimatedCost;
    private boolean canMeetDeadline;
    private int estimatedDaysToComplete;
    private List<String> strengths;
    private List<String> limitations;
}