package com.example.fuzzymachineefficiency.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MachineDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    private String name;
    private Double dailyProduction;
    private Double errorMargin;
    private Double maintenanceInterval;
    private Double standbyTime;
    private Double energyConsumption;
}
