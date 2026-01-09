package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

@Data
public class ProductionTargetRequest {
    private double dailyProductionTarget;
    private int deadlineDays;
    private double maxBudget;
    private boolean prioritizeQuality;
    private boolean prioritizeSpeed;
    private boolean prioritizeEnergySaving;
}