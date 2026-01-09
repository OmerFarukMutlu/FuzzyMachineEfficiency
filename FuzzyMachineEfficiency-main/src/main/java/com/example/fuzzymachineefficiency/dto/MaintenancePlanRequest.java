package com.example.fuzzymachineefficiency.dto;

import com.example.fuzzymachineefficiency.entity.enums.MaintenanceFrequency;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class MaintenancePlanRequest {
    private LocalDate startDate;
    private int durationMonths;
    private MaintenanceFrequency frequency;
    private boolean includeWeekends;
    private List<MaintenanceTask> tasks;
}