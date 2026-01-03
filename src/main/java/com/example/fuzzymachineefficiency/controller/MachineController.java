package com.example.fuzzymachineefficiency.controller;

import com.example.fuzzymachineefficiency.dto.*;
import com.example.fuzzymachineefficiency.entity.Machine;
import com.example.fuzzymachineefficiency.service.MachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineService machineService;

    @PostMapping("/add")
    public ResponseEntity<Machine> addMachine(@RequestBody MachineDto machineDto) {
        return ResponseEntity.ok(machineService.addMachine(machineDto));
    }

    @PostMapping("/simulate")
    public ResponseEntity<FullAnalysisResponse> simulate(@RequestBody SimulationRequest request) {
        return ResponseEntity.ok(machineService.simulate(request));
    }

    @GetMapping
    public ResponseEntity<List<MachineDto>> getAllMachines() {
        return ResponseEntity.ok(machineService.getAllMachines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MachineDto> getMachineById(@PathVariable Long id) {
        return ResponseEntity.ok(machineService.getMachineById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MachineDto> updateMachine(@PathVariable Long id, @RequestBody MachineDto machineDto) {
        return ResponseEntity.ok(machineService.updateMachine(id, machineDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMachine(@PathVariable Long id) {
        machineService.deleteMachine(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<MachineDto>> getPagedMachines(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "id") String sortBy, @RequestParam(defaultValue = "asc") String direction) {
        return ResponseEntity.ok(machineService.getPagedMachines(page, size, sortBy, direction));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<MachineDto>> filterMachinesByEfficiency(@RequestParam(required = false) Double minEfficiency, @RequestParam(required = false) Double maxEfficiency) {
        return ResponseEntity.ok(machineService.filterMachinesByEfficiency(minEfficiency, maxEfficiency));
    }

    @GetMapping("/{id}/efficiency-analysis")
    public ResponseEntity<MachineAnalysisResponse> getEfficiencyAnalysis(@PathVariable Long id) {
        return ResponseEntity.ok(machineService.getEfficiencyAnalysis(id));
    }

    @PostMapping("/{id}/maintenance-plan")
    public ResponseEntity<MaintenancePlanResponse> createMaintenancePlan(@PathVariable Long id, @RequestBody MaintenancePlanRequest request) {
        return ResponseEntity.ok(machineService.createMaintenancePlan(id, request));
    }

    @PostMapping("/compare")
    public ResponseEntity<MachineComparisonResponse> compareMachines(@RequestBody MachineComparisonRequest request) {
        return ResponseEntity.ok(machineService.compareMachines(request));
    }

    @GetMapping("/{id}/optimization-suggestions")
    public ResponseEntity<OptimizationResponse> getOptimizationSuggestions(@PathVariable Long id) {
        return ResponseEntity.ok(machineService.getOptimizationSuggestions(id));
    }

    @PostMapping("/recommend")
    public ResponseEntity<List<MachineRecommendationDto>> recommendMachines(@RequestBody ProductionTargetRequest request) {
        return ResponseEntity.ok(machineService.recommendMachines(request));
    }

    @GetMapping("/top-performers")
    public ResponseEntity<List<MachineDto>> getTopPerformingMachines(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(machineService.getTopPerformingMachines(limit));
    }

    @GetMapping("/needs-improvement")
    public ResponseEntity<List<MachineDto>> getMachinesNeedingImprovement() {
        return ResponseEntity.ok(machineService.getMachinesNeedingImprovement());
    }

    @GetMapping("/export/excel")
    public ResponseEntity<Resource> exportMachinesToExcel() {
        Resource resource = machineService.exportMachinesToExcel();

        
        
        return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=machines.csv")
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(resource);
    }

    @PostMapping("/import/excel")
    public ResponseEntity<ImportResponse> importMachinesFromExcel(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(machineService.importMachinesFromExcel(file));
    }

    @GetMapping("/statistics")
    public ResponseEntity<MachineStatisticsDto> getMachineStatistics() {
        return ResponseEntity.ok(machineService.getMachineStatistics());
    }

    @GetMapping("/search")
    public ResponseEntity<List<MachineDto>> searchMachinesByName(@RequestParam String name) {
        return ResponseEntity.ok(machineService.searchMachinesByName(name));
    }
}