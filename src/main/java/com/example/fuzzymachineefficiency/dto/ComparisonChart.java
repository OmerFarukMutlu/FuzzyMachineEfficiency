package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

import java.util.List;

@Data
public class ComparisonChart {
    private String chartType;
    private String title;
    private List<String> labels;
    private List<ChartDataset> datasets;
}