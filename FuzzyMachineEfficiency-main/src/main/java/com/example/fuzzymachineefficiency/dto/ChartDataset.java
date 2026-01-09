package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

import java.util.List;

@Data
public class ChartDataset {
    private String label;
    private List<Double> data;
    private String backgroundColor;
    private String borderColor;
}