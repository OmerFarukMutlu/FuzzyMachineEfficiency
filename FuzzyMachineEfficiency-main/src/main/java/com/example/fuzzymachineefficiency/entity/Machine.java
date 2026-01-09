package com.example.fuzzymachineefficiency.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "machines")
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Double dailyProduction;
    private Double errorMargin;
    private Double maintenanceInterval;
    private Double standbyTime;
    private Double energyConsumption;
}