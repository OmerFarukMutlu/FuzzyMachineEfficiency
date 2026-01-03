package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

import java.util.List;

@Data
public class ImportResponse {
    private int totalRecords;
    private int successfulImports;
    private int failedImports;
    private List<String> errors;
    private List<MachineDto> importedMachines;
}