package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

@Data
public class MachineDataRequest {
    private double dailyProduction;
    private double errorMargin;
    private double maintenanceInterval;
    private double standbyTime;
    private double energyConsumption;
}