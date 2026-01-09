package com.example.fuzzymachineefficiency.service;

import com.example.fuzzymachineefficiency.dto.*;
import com.example.fuzzymachineefficiency.entity.Machine;
import com.example.fuzzymachineefficiency.mapper.MachineMapper;
import com.example.fuzzymachineefficiency.repository.MachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineRepository machineRepository;
    private final FuzzyService fuzzyService;
    private final MachineMapper machineMapper;

    public Machine addMachine(MachineDto machineDto) {
        if (machineDto == null) {
            throw new IllegalArgumentException("Makine bilgileri boş olamaz");
        }
        Machine machine = machineMapper.dtoToEntity(machineDto);
        return machineRepository.save(machine);
    }

    public FullAnalysisResponse simulate(SimulationRequest request) {
        Machine machine = findMachineById(request.getMachineId());

        MachineDataRequest dataRequest = createMachineDataRequest(machine);
        MachineAnalysisResponse fuzzyResult = fuzzyService.calculate(dataRequest);

        double totalEnergyCost = machine.getEnergyConsumption() * request.getElectricityCost() * request.getDeadlineDays();
        double totalLaborCost = 8 * request.getLaborCostPerHour() * request.getDeadlineDays();
        double totalMaintenanceCost = (request.getDeadlineDays() / machine.getMaintenanceInterval()) * request.getMaintenanceCostPerSession();
        double totalCost = totalEnergyCost + totalLaborCost + totalMaintenanceCost;
        double daysNeeded = request.getTargetProduction() / (machine.getDailyProduction() * (1 - machine.getErrorMargin() / 100));
        boolean isDeadlineMet = daysNeeded <= request.getDeadlineDays();

        FullAnalysisResponse response = new FullAnalysisResponse();
        response.setMachineName(machine.getName());
        response.setFuzzyResult(fuzzyResult);
        response.setTotalCost(Math.round(totalCost * 100.0) / 100.0);
        response.setCalculatedDays(Math.round(daysNeeded * 100.0) / 100.0);
        response.setIsDeadlineMet(isDeadlineMet);

        String costDetails = String.format(
        "Enerji Maliyeti: %.2f TL\nİşçilik Maliyeti: %.2f TL\nBakım Maliyeti: %.2f TL",
        totalEnergyCost, totalLaborCost, totalMaintenanceCost);
        response.setCostDetails(costDetails);

        return response;
    }

    public List<MachineDto> getAllMachines() {
        List<Machine> machines = machineRepository.findAll();
        return machines.stream()
        .map(machineMapper::entityToDto)
        .collect(Collectors.toList());
    }

    public MachineDto getMachineById(Long id) {
        Machine machine = findMachineById(id);
        return machineMapper.entityToDto(machine);
    }

    public MachineDto updateMachine(Long id, MachineDto machineDto) {
        Machine existingMachine = findMachineById(id);

        machineDto.setId(id);
        machineMapper.updateMachineFromDto(machineDto, existingMachine);

        Machine updatedMachine = machineRepository.save(existingMachine);
        return machineMapper.entityToDto(updatedMachine);
    }

    public void deleteMachine(Long id) {
        if (!machineRepository.existsById(id)) {
            throw new IllegalArgumentException("Makine bulunamadı: " + id);
        }
        machineRepository.deleteById(id);
    }

    public Page<MachineDto> getPagedMachines(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") ?
        Sort.by(sortBy).descending() :
        Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Machine> machinePage = machineRepository.findAll(pageable);

        return machinePage.map(machineMapper::entityToDto);
    }

    public List<MachineDto> filterMachinesByEfficiency(Double minEfficiency, Double maxEfficiency) {
        List<Machine> allMachines = machineRepository.findAll();

        if (minEfficiency == null && maxEfficiency == null) {
            return allMachines.stream()
            .map(machineMapper::entityToDto)
            .collect(Collectors.toList());
        }

        return allMachines.stream()
        .filter(machine -> {
            MachineDataRequest request = createMachineDataRequest(machine);
            MachineAnalysisResponse analysis = fuzzyService.calculate(request);

            double score = analysis.getEfficiencyScore();

            if (minEfficiency != null && maxEfficiency != null) {
                return score >= minEfficiency && score <= maxEfficiency;
            } else if (minEfficiency != null) {
                return score >= minEfficiency;
            } else {
                return score <= maxEfficiency;
            }
        })
        .map(machineMapper::entityToDto)
        .collect(Collectors.toList());
    }

    public MachineAnalysisResponse getEfficiencyAnalysis(Long id) {
        Machine machine = findMachineById(id);
        MachineDataRequest request = createMachineDataRequest(machine);
        return fuzzyService.calculate(request);
    }

    public MaintenancePlanResponse createMaintenancePlan(Long id, MaintenancePlanRequest request) {
        Machine machine = findMachineById(id);

        List<ScheduledMaintenance> scheduledMaintenances = new ArrayList<>();

        LocalDate currentDate = request.getStartDate();
        LocalDate endDate = request.getStartDate().plusMonths(request.getDurationMonths());

        while (currentDate.isBefore(endDate)) {
            if (!request.isIncludeWeekends() && (currentDate.getDayOfWeek().getValue() > 5)) {
                currentDate = currentDate.plusDays(1);
                continue;
            }

            ScheduledMaintenance maintenance = new ScheduledMaintenance();
            maintenance.setDate(currentDate);
            maintenance.setTasks(new ArrayList<>(request.getTasks()));
            maintenance.setStatus("SCHEDULED");

            int totalDuration = request.getTasks().stream()
            .mapToInt(MaintenanceTask::getEstimatedHours)
            .sum();
            maintenance.setTotalDuration(totalDuration);

            scheduledMaintenances.add(maintenance);

            currentDate = switch (request.getFrequency()) {
                case DAILY -> currentDate.plusDays(1);
                case WEEKLY -> currentDate.plusWeeks(1);
                case BIWEEKLY -> currentDate.plusWeeks(2);
                case MONTHLY -> currentDate.plusMonths(1);
                case QUARTERLY -> currentDate.plusMonths(3);
                case YEARLY -> currentDate.plusYears(1);
            };
        }

        int totalMaintenanceHours = scheduledMaintenances.stream()
        .mapToInt(ScheduledMaintenance::getTotalDuration)
        .sum();

        return getMaintenancePlanResponse(totalMaintenanceHours, machine, scheduledMaintenances);
    }

    private static MaintenancePlanResponse getMaintenancePlanResponse(int totalMaintenanceHours, Machine machine, List<ScheduledMaintenance> scheduledMaintenances) {
        double estimatedCost = totalMaintenanceHours * 150;

        MaintenancePlanResponse response = new MaintenancePlanResponse();
        response.setMachineId(machine.getId());
        response.setMachineName(machine.getName());
        response.setScheduledMaintenances(scheduledMaintenances);
        response.setTotalMaintenanceHours(totalMaintenanceHours);
        response.setEstimatedCost(estimatedCost);

        if (!scheduledMaintenances.isEmpty()) {
            response.setNextMaintenanceDate(scheduledMaintenances.getFirst().getDate().toString());
        }
        return response;
    }

    public MachineComparisonResponse compareMachines(MachineComparisonRequest request) {
        List<Machine> machines = machineRepository.findAllById(request.getMachineIds());

        if (machines.size() != request.getMachineIds().size()) {
            throw new IllegalArgumentException("Bir veya daha fazla makine bulunamadı");
        }

        List<MachineComparisonItem> comparisonItems = new ArrayList<>();
        Map<String, MachineComparisonItem> bestPerFactorMap = new HashMap<>();

        for (Machine machine : machines) {
            MachineComparisonItem item = new MachineComparisonItem();
            item.setMachineId(machine.getId());
            item.setMachineName(machine.getName());

            MachineDataRequest dataRequest = createMachineDataRequest(machine);
            MachineAnalysisResponse analysis = fuzzyService.calculate(dataRequest);

            Map<String, Double> factorScores = new HashMap<>();

            for (String factor : request.getComparisonFactors()) {
                double score = switch (factor) {
                    case "efficiency" -> analysis.getEfficiencyScore();
                    case "production" -> machine.getDailyProduction();
                    case "errorRate" -> 100 - machine.getErrorMargin();
                    case "maintenanceEfficiency" -> machine.getMaintenanceInterval();
                    case "energyEfficiency" -> 100 - machine.getEnergyConsumption();
                    default -> 50.0;
                };

                factorScores.put(factor, score);

                if (!bestPerFactorMap.containsKey(factor) ||
                bestPerFactorMap.get(factor).getFactorScores().get(factor) < score) {
                    bestPerFactorMap.put(factor, item);
                }
            }

            item.setFactorScores(factorScores);

            double overallScore = factorScores.values().stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0.0);
            item.setOverallScore(overallScore);

            List<String> strengths = new ArrayList<>();
            List<String> weaknesses = new ArrayList<>();

            factorScores.forEach((factor, score) -> {
                if (score >= 75.0) {
                    strengths.add(factor + " (" + String.format("%.1f", score) + ")");
                } else if (score < 50.0) {
                    weaknesses.add(factor + " (" + String.format("%.1f", score) + ")");
                }
            });

            item.setStrengths(strengths);
            item.setWeaknesses(weaknesses);

            comparisonItems.add(item);
        }

        MachineComparisonItem bestOverall = comparisonItems.stream()
        .max(Comparator.comparing(MachineComparisonItem::getOverallScore))
        .orElse(null);

        List<ComparisonChart> charts = new ArrayList<>();

        ComparisonChart radarChart = createRadarChart(request.getComparisonFactors(), comparisonItems);
        charts.add(radarChart);

        ComparisonChart barChart = createBarChart(comparisonItems);
        charts.add(barChart);

        MachineComparisonResponse response = new MachineComparisonResponse();
        response.setComparisonResults(comparisonItems);
        response.setBestOverallPerformer(bestOverall);
        response.setBestPerFactorPerformers(bestPerFactorMap);
        response.setCharts(charts);

        return response;
    }

    private ComparisonChart createRadarChart(List<String> factors, List<MachineComparisonItem> items) {
        ComparisonChart radarChart = new ComparisonChart();
        radarChart.setChartType("radar");
        radarChart.setTitle("Makine Performans Karşılaştırması");
        radarChart.setLabels(new ArrayList<>(factors));

        List<ChartDataset> datasets = new ArrayList<>();

        for (MachineComparisonItem item : items) {
            ChartDataset dataset = new ChartDataset();
            dataset.setLabel(item.getMachineName());

            List<Double> data = factors.stream()
            .map(factor -> item.getFactorScores().getOrDefault(factor, 0.0))
            .collect(Collectors.toList());
            dataset.setData(data);

            Random random = new Random();
            int r = random.nextInt(256);
            int g = random.nextInt(256);
            int b = random.nextInt(256);

            dataset.setBackgroundColor(String.format("rgba(%d, %d, %d, 0.2)", r, g, b));
            dataset.setBorderColor(String.format("rgba(%d, %d, %d, 1)", r, g, b));

            datasets.add(dataset);
        }

        radarChart.setDatasets(datasets);
        return radarChart;
    }

    private ComparisonChart createBarChart(List<MachineComparisonItem> items) {
        ComparisonChart barChart = new ComparisonChart();
        barChart.setChartType("bar");
        barChart.setTitle("Genel Performans Karşılaştırması");
        barChart.setLabels(items.stream()
        .map(MachineComparisonItem::getMachineName)
        .collect(Collectors.toList()));

        List<ChartDataset> datasets = new ArrayList<>();
        ChartDataset dataset = new ChartDataset();
        dataset.setLabel("Genel Skor");
        dataset.setData(items.stream()
        .map(MachineComparisonItem::getOverallScore)
        .collect(Collectors.toList()));
        dataset.setBackgroundColor("rgba(54, 162, 235, 0.2)");
        dataset.setBorderColor("rgba(54, 162, 235, 1)");

        datasets.add(dataset);
        barChart.setDatasets(datasets);
        return barChart;
    }

    public OptimizationResponse getOptimizationSuggestions(Long id) {
        Machine machine = findMachineById(id);

        MachineDataRequest currentRequest = createMachineDataRequest(machine);
        MachineAnalysisResponse currentAnalysis = fuzzyService.calculate(currentRequest);

        List<OptimizationSuggestion> suggestions = createOptimizationSuggestions(machine);

        MachineDataRequest optimizedRequest = createOptimizedRequest(machine, suggestions);
        MachineAnalysisResponse optimizedAnalysis = fuzzyService.calculate(optimizedRequest);

        OptimizedState optimizedState = new OptimizedState();
        optimizedState.setPotentialEfficiencyScore(optimizedAnalysis.getEfficiencyScore());
        optimizedState.setPotentialEfficiencyStatus(optimizedAnalysis.getEfficiencyStatus());

        double improvementPercentage = ((optimizedAnalysis.getEfficiencyScore() - currentAnalysis.getEfficiencyScore())
        / currentAnalysis.getEfficiencyScore()) * 100;
        optimizedState.setImprovementPercentage(Math.max(0, improvementPercentage));

        double estimatedAnnualSavings = (optimizedState.getImprovementPercentage() / 100) *
        machine.getDailyProduction() * 365 * 100;
        optimizedState.setEstimatedCostSavings(estimatedAnnualSavings);

        int implementationDays = calculateImplementationDays(suggestions);
        optimizedState.setEstimatedImplementationDays(implementationDays);

        OptimizationResponse response = new OptimizationResponse();
        response.setMachineId(machine.getId());
        response.setMachineName(machine.getName());
        response.setCurrentEfficiencyScore(currentAnalysis.getEfficiencyScore());
        response.setSuggestions(suggestions);
        response.setPotentialOptimizedState(optimizedState);

        return response;
    }

    private List<OptimizationSuggestion> createOptimizationSuggestions(Machine machine) {
        List<OptimizationSuggestion> suggestions = new ArrayList<>();

        if (machine.getMaintenanceInterval() > 30) {
            OptimizationSuggestion maintenanceSuggestion = new OptimizationSuggestion();
            maintenanceSuggestion.setParameter("maintenanceInterval");
            maintenanceSuggestion.setCurrentValue(machine.getMaintenanceInterval());
            maintenanceSuggestion.setSuggestedValue(Math.max(15, machine.getMaintenanceInterval() * 0.7));
            maintenanceSuggestion.setPotentialImprovementPercentage(15.0);
            maintenanceSuggestion.setReasonForSuggestion("Daha sık bakım, arıza oranını azaltır ve makine ömrünü uzatır");
            maintenanceSuggestion.setImplementationDifficulty("MEDIUM");
            maintenanceSuggestion.setEstimatedCostOfImplementation(5000.0);

            suggestions.add(maintenanceSuggestion);
        }

        if (machine.getStandbyTime() > 60) {
            OptimizationSuggestion standbyTimeSuggestion = new OptimizationSuggestion();
            standbyTimeSuggestion.setParameter("standbyTime");
            standbyTimeSuggestion.setCurrentValue(machine.getStandbyTime());
            standbyTimeSuggestion.setSuggestedValue(Math.max(30, machine.getStandbyTime() * 0.6));
            standbyTimeSuggestion.setPotentialImprovementPercentage(20.0);
            standbyTimeSuggestion.setReasonForSuggestion("Bekleme süresinin azaltılması üretim kapasitesini artırır");
            standbyTimeSuggestion.setImplementationDifficulty("EASY");
            standbyTimeSuggestion.setEstimatedCostOfImplementation(2000.0);

            suggestions.add(standbyTimeSuggestion);
        }

        if (machine.getEnergyConsumption() > 80) {
            OptimizationSuggestion energySuggestion = new OptimizationSuggestion();
            energySuggestion.setParameter("energyConsumption");
            energySuggestion.setCurrentValue(machine.getEnergyConsumption());
            energySuggestion.setSuggestedValue(Math.max(60, machine.getEnergyConsumption() * 0.8));
            energySuggestion.setPotentialImprovementPercentage(25.0);
            energySuggestion.setReasonForSuggestion("Enerji verimliliği sağlayacak yeni ekipmanlar kullanılması");
            energySuggestion.setImplementationDifficulty("HARD");
            energySuggestion.setEstimatedCostOfImplementation(15000.0);

            suggestions.add(energySuggestion);
        }

        if (machine.getErrorMargin() > 5) {
            OptimizationSuggestion errorSuggestion = new OptimizationSuggestion();
            errorSuggestion.setParameter("errorMargin");
            errorSuggestion.setCurrentValue(machine.getErrorMargin());
            errorSuggestion.setSuggestedValue(Math.max(2, machine.getErrorMargin() * 0.6));
            errorSuggestion.setPotentialImprovementPercentage(30.0);
            errorSuggestion.setReasonForSuggestion("Sensör ve kontrol sistemlerinin güncellenmesi hata oranını düşürebilir");
            errorSuggestion.setImplementationDifficulty("MEDIUM");
            errorSuggestion.setEstimatedCostOfImplementation(10000.0);

            suggestions.add(errorSuggestion);
        }

        return suggestions;
    }

    private MachineDataRequest createOptimizedRequest(Machine machine, List<OptimizationSuggestion> suggestions) {
        MachineDataRequest optimizedRequest = createMachineDataRequest(machine);

        for (OptimizationSuggestion suggestion : suggestions) {
            switch (suggestion.getParameter()) {
                case "maintenanceInterval":
                    optimizedRequest.setMaintenanceInterval(suggestion.getSuggestedValue());
                    break;
                case "standbyTime":
                    optimizedRequest.setStandbyTime(suggestion.getSuggestedValue());
                    break;
                case "energyConsumption":
                    optimizedRequest.setEnergyConsumption(suggestion.getSuggestedValue());
                    break;
                case "errorMargin":
                    optimizedRequest.setErrorMargin(suggestion.getSuggestedValue());
                    break;
            }
        }

        return optimizedRequest;
    }

    private int calculateImplementationDays(List<OptimizationSuggestion> suggestions) {
        return suggestions.stream()
        .mapToInt(s -> {
            return switch (s.getImplementationDifficulty()) {
                case "EASY" -> 7;
                case "MEDIUM" -> 21;
                case "HARD" -> 45;
                default -> 14;
            };
        })
        .sum();
    }

    public List<MachineRecommendationDto> recommendMachines(ProductionTargetRequest request) {
        List<Machine> allMachines = machineRepository.findAll();

        return allMachines.stream()
        .map(machine -> createMachineRecommendation(machine, request))
        .sorted(Comparator.comparing(MachineRecommendationDto::getMatchScore).reversed())
        .collect(Collectors.toList());
    }

    private MachineRecommendationDto createMachineRecommendation(Machine machine, ProductionTargetRequest request) {
        double effectiveProduction = machine.getDailyProduction() * (1 - machine.getErrorMargin() / 100);
        int daysNeeded = (int) Math.ceil(request.getDailyProductionTarget() / effectiveProduction);

        MachineDataRequest dataRequest = createMachineDataRequest(machine);
        MachineAnalysisResponse analysis = fuzzyService.calculate(dataRequest);

        double energyCostPerDay = machine.getEnergyConsumption() * 5;
        double operationalCostPerDay = 1000;
        double dailyCost = energyCostPerDay + operationalCostPerDay;
        double totalCost = dailyCost * daysNeeded;

        boolean canMeetDeadline = daysNeeded <= request.getDeadlineDays();
        boolean withinBudget = totalCost <= request.getMaxBudget();

        double matchScore = calculateMatchScore(machine, analysis, canMeetDeadline, withinBudget,
        effectiveProduction, request);

        List<String> strengths = getStrengths(machine, effectiveProduction, canMeetDeadline,
        withinBudget, request);
        List<String> limitations = getLimitations(machine, effectiveProduction, canMeetDeadline,
        withinBudget, request);

        MachineRecommendationDto recommendation = new MachineRecommendationDto();
        recommendation.setMachineId(machine.getId());
        recommendation.setMachineName(machine.getName());
        recommendation.setEfficiencyScore(analysis.getEfficiencyScore());
        recommendation.setMatchScore(matchScore);
        recommendation.setWithinBudget(withinBudget);
        recommendation.setEstimatedCost(totalCost);
        recommendation.setCanMeetDeadline(canMeetDeadline);
        recommendation.setEstimatedDaysToComplete(daysNeeded);
        recommendation.setStrengths(strengths);
        recommendation.setLimitations(limitations);

        return recommendation;
    }

    private double calculateMatchScore(Machine machine, MachineAnalysisResponse analysis,
                                       boolean canMeetDeadline, boolean withinBudget,
                                       double effectiveProduction, ProductionTargetRequest request) {
        double matchScore = 0.0;

        if (canMeetDeadline) {
            matchScore += 40;
        }

        if (withinBudget) {
            matchScore += 30;
        }

        matchScore += analysis.getEfficiencyScore() * 0.3;

        if (request.isPrioritizeQuality() && machine.getErrorMargin() < 5) {
            matchScore += 10;
        }

        if (request.isPrioritizeSpeed() && effectiveProduction > request.getDailyProductionTarget()) {
            matchScore += 10;
        }

        if (request.isPrioritizeEnergySaving() && machine.getEnergyConsumption() < 70) {
            matchScore += 10;
        }

        return matchScore;
    }

    private List<String> getStrengths(Machine machine, double effectiveProduction,
                                      boolean canMeetDeadline, boolean withinBudget,
                                      ProductionTargetRequest request) {
        List<String> strengths = new ArrayList<>();

        if (effectiveProduction > request.getDailyProductionTarget()) {
            strengths.add("Üretim kapasitesi hedefin üzerinde");
        }

        if (machine.getErrorMargin() < 5) {
            strengths.add("Düşük hata oranı");
        }

        if (machine.getEnergyConsumption() < 70) {
            strengths.add("Düşük enerji tüketimi");
        }

        if (canMeetDeadline) {
            strengths.add("Hedef sürede tamamlayabilir");
        }

        if (withinBudget) {
            strengths.add("Bütçe içinde");
        }

        return strengths;
    }

    private List<String> getLimitations(Machine machine, double effectiveProduction,
                                        boolean canMeetDeadline, boolean withinBudget,
                                        ProductionTargetRequest request) {
        List<String> limitations = new ArrayList<>();

        if (effectiveProduction < request.getDailyProductionTarget()) {
            limitations.add("Üretim kapasitesi hedefin altında");
        }

        if (machine.getErrorMargin() > 10) {
            limitations.add("Yüksek hata oranı");
        }

        if (machine.getEnergyConsumption() >= 70) {
            limitations.add("Yüksek enerji tüketimi");
        }

        if (!canMeetDeadline) {
            limitations.add("Hedef sürede tamamlayamaz");
        }

        if (!withinBudget) {
            limitations.add("Bütçe aşımı");
        }

        return limitations;
    }

    public List<MachineDto> getTopPerformingMachines(int limit) {
        List<Machine> allMachines = machineRepository.findAll();

        return allMachines.stream()
        .map(machine -> {
            MachineDataRequest request = createMachineDataRequest(machine);
            MachineAnalysisResponse analysis = fuzzyService.calculate(request);

            return new AbstractMap.SimpleEntry<>(machine, analysis.getEfficiencyScore());
        })
        .sorted(Map.Entry.<Machine, Double>comparingByValue().reversed())
        .limit(limit)
        .map(entry -> machineMapper.entityToDto(entry.getKey()))
        .collect(Collectors.toList());
    }

    public List<MachineDto> getMachinesNeedingImprovement() {
        List<Machine> allMachines = machineRepository.findAll();

        return allMachines.stream()
        .map(machine -> {
            MachineDataRequest request = createMachineDataRequest(machine);
            MachineAnalysisResponse analysis = fuzzyService.calculate(request);

            return new AbstractMap.SimpleEntry<>(machine, analysis.getEfficiencyScore());
        })
        .filter(entry -> entry.getValue() < 50.0)
        .map(entry -> machineMapper.entityToDto(entry.getKey()))
        .collect(Collectors.toList());
    }

    public Resource exportMachinesToExcel() {
        List<Machine> machines = machineRepository.findAll();

        StringBuilder csvContent = new StringBuilder();

        csvContent.append("ID,Makine Adı,Günlük Üretim,Hata Payı,Bakım Aralığı,Bekleme Süresi,Enerji Tüketimi,Verimlilik Skoru\n");

        for (Machine machine : machines) {
            MachineDataRequest request = createMachineDataRequest(machine);
            MachineAnalysisResponse analysis = fuzzyService.calculate(request);

            csvContent.append(machine.getId())
            .append(",").append(machine.getName())
            .append(",").append(machine.getDailyProduction())
            .append(",").append(machine.getErrorMargin())
            .append(",").append(machine.getMaintenanceInterval())
            .append(",").append(machine.getStandbyTime())
            .append(",").append(machine.getEnergyConsumption())
            .append(",").append(analysis.getEfficiencyScore())
            .append("\n");
        }

        byte[] bom = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] contentBytes = csvContent.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

        byte[] finalBytes = new byte[bom.length + contentBytes.length];
        System.arraycopy(bom, 0, finalBytes, 0, bom.length);
        System.arraycopy(contentBytes, 0, finalBytes, bom.length, contentBytes.length);

        return new ByteArrayResource(finalBytes);
    }

    public ImportResponse importMachinesFromExcel(MultipartFile file) {
        ImportResponse response = new ImportResponse();
        response.setTotalRecords(0);
        response.setSuccessfulImports(0);
        response.setFailedImports(0);
        response.setErrors(new ArrayList<>());
        response.setImportedMachines(new ArrayList<>());

        try {
            String content = new String(file.getBytes());
            String[] lines = content.split("\n");

            response.setTotalRecords(lines.length - 1);

            for (int i = 1; i < lines.length; i++) {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;

                String[] values = line.split(",");

                try {
                    if (values.length < 6) {
                        throw new IllegalArgumentException("Yetersiz veri sütunu: " + values.length);
                    }

                    MachineDto machineDto = new MachineDto();
                    machineDto.setName(values[1]);
                    machineDto.setDailyProduction(Double.parseDouble(values[2]));
                    machineDto.setErrorMargin(Double.parseDouble(values[3]));
                    machineDto.setMaintenanceInterval(Double.parseDouble(values[4]));
                    machineDto.setStandbyTime(Double.parseDouble(values[5]));
                    machineDto.setEnergyConsumption(Double.parseDouble(values[6]));

                    Machine savedMachine = addMachine(machineDto);
                    machineDto.setId(savedMachine.getId());

                    response.getImportedMachines().add(machineDto);
                    response.setSuccessfulImports(response.getSuccessfulImports() + 1);
                } catch (Exception e) {
                    response.setFailedImports(response.getFailedImports() + 1);
                    response.getErrors().add("Satır " + i + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            response.getErrors().add("Dosya işleme hatası: " + e.getMessage());
        }

        return response;
    }

    public MachineStatisticsDto getMachineStatistics() {
        List<Machine> machines = machineRepository.findAll();

        MachineStatisticsDto stats = new MachineStatisticsDto();
        stats.setTotalMachines(machines.size());

        if (machines.isEmpty()) {
            stats.setAverageEfficiencyScore(0.0);
            stats.setAverageMaintenanceInterval(0.0);
            stats.setAverageEnergyConsumption(0.0);
            return stats;
        }

        List<AbstractMap.SimpleEntry<Machine, Double>> machinesWithScores = machines.stream()
        .map(machine -> {
            MachineDataRequest request = createMachineDataRequest(machine);
            MachineAnalysisResponse analysis = fuzzyService.calculate(request);
            return new AbstractMap.SimpleEntry<>(machine, analysis.getEfficiencyScore());
        })
        .collect(Collectors.toList());

        double avgEfficiency = machinesWithScores.stream()
        .mapToDouble(Map.Entry::getValue)
        .average()
        .orElse(0.0);
        stats.setAverageEfficiencyScore(avgEfficiency);

        AbstractMap.SimpleEntry<Machine, Double> mostEfficient = machinesWithScores.stream()
        .max(Map.Entry.comparingByValue())
        .orElse(null);

        AbstractMap.SimpleEntry<Machine, Double> leastEfficient = machinesWithScores.stream()
        .min(Map.Entry.comparingByValue())
        .orElse(null);

        if (mostEfficient != null) {
            stats.setMostEfficientMachine(machineMapper.entityToDto(mostEfficient.getKey()));
        }

        if (leastEfficient != null) {
            stats.setLeastEfficientMachine(machineMapper.entityToDto(leastEfficient.getKey()));
        }

        Map<String, Integer> efficiencyDistribution = createEfficiencyDistribution(machinesWithScores);
        stats.setEfficiencyDistribution(efficiencyDistribution);

        double avgMaintenanceInterval = machines.stream()
        .mapToDouble(Machine::getMaintenanceInterval)
        .average()
        .orElse(0.0);
        stats.setAverageMaintenanceInterval(avgMaintenanceInterval);

        double avgEnergyConsumption = machines.stream()
        .mapToDouble(Machine::getEnergyConsumption)
        .average()
        .orElse(0.0);
        stats.setAverageEnergyConsumption(avgEnergyConsumption);

        stats.setEfficiencyTrendByMonth(createEfficiencyTrend());
        stats.setProductionVsEfficiency(createProductionVsEfficiency());

        return stats;
    }

    private Map<String, Integer> createEfficiencyDistribution(List<AbstractMap.SimpleEntry<Machine, Double>> machinesWithScores) {
        Map<String, Integer> efficiencyDistribution = new HashMap<>();
        efficiencyDistribution.put("VERY_GOOD", 0);
        efficiencyDistribution.put("GOOD", 0);
        efficiencyDistribution.put("MEDIUM", 0);
        efficiencyDistribution.put("BAD", 0);
        efficiencyDistribution.put("VERY_BAD", 0);

        for (AbstractMap.SimpleEntry<Machine, Double> entry : machinesWithScores) {
            double score = entry.getValue();

            if (score >= 90) {
                efficiencyDistribution.put("VERY_GOOD", efficiencyDistribution.get("VERY_GOOD") + 1);
            } else if (score >= 75) {
                efficiencyDistribution.put("GOOD", efficiencyDistribution.get("GOOD") + 1);
            } else if (score >= 50) {
                efficiencyDistribution.put("MEDIUM", efficiencyDistribution.get("MEDIUM") + 1);
            } else if (score >= 25) {
                efficiencyDistribution.put("BAD", efficiencyDistribution.get("BAD") + 1);
            } else {
                efficiencyDistribution.put("VERY_BAD", efficiencyDistribution.get("VERY_BAD") + 1);
            }
        }

        return efficiencyDistribution;
    }

    private List<ChartData> createEfficiencyTrend() {
        List<ChartData> efficiencyTrend = new ArrayList<>();
        String[] months = {"Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"};
        double[] monthlyEfficiency = {65.3, 67.1, 70.2, 72.5, 75.8, 78.2};

        for (int i = 0; i < months.length; i++) {
            ChartData chartData = new ChartData();
            chartData.setLabel(months[i]);
            chartData.setValue(monthlyEfficiency[i]);
            efficiencyTrend.add(chartData);
        }

        return efficiencyTrend;
    }

    private List<ChartData> createProductionVsEfficiency() {
        List<ChartData> productionVsEfficiency = new ArrayList<>();

        double[] productionLevels = {100, 200, 300, 400, 500, 600};
        double[] efficiencyLevels = {60.0, 65.5, 70.2, 68.7, 72.1, 69.5};

        for (int i = 0; i < productionLevels.length; i++) {
            ChartData chartData = new ChartData();
            chartData.setLabel(String.valueOf(productionLevels[i]));
            chartData.setValue(efficiencyLevels[i]);
            productionVsEfficiency.add(chartData);
        }

        return productionVsEfficiency;
    }

    public List<MachineDto> searchMachinesByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return getAllMachines();
        }

        String searchTerm = name.toLowerCase();

        return machineRepository.findAll().stream()
        .filter(machine -> machine.getName().toLowerCase().contains(searchTerm))
        .map(machineMapper::entityToDto)
        .collect(Collectors.toList());
    }

    private Machine findMachineById(Long id) {
        return machineRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Makine bulunamadı: " + id));
    }

    private MachineDataRequest createMachineDataRequest(Machine machine) {
        MachineDataRequest request = new MachineDataRequest();
        request.setDailyProduction(machine.getDailyProduction());
        request.setErrorMargin(machine.getErrorMargin());
        request.setMaintenanceInterval(machine.getMaintenanceInterval());
        request.setStandbyTime(machine.getStandbyTime());
        request.setEnergyConsumption(machine.getEnergyConsumption());
        return request;
    }
}