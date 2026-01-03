package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

import java.util.List;

@Data
public class MaintenancePlanResponse {
    private Long machineId;
    private String machineName;
    private List<ScheduledMaintenance> scheduledMaintenances;
    private int totalMaintenanceHours;
    private double estimatedCost;
    private String nextMaintenanceDate;
}