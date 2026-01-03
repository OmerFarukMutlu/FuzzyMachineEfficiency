package com.example.fuzzymachineefficiency.dto;

import com.example.fuzzymachineefficiency.entity.enums.MaintenanceTaskPriority;
import lombok.Data;

import java.util.List;

@Data
public class MaintenanceTask {
    private String name;
    private String description;
    private int estimatedHours;
    private MaintenanceTaskPriority priority;
    private List<String> requiredResources;
}