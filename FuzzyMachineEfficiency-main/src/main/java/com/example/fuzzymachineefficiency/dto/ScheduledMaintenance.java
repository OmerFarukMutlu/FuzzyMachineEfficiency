package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ScheduledMaintenance {
    private LocalDate date;
    private List<MaintenanceTask> tasks;
    private int totalDuration;
    private String status;
}