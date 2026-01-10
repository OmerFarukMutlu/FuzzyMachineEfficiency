export type Id = number;

export interface MachineDto {
  id?: Id;
  name: string;
  dailyProduction: number;
  errorMargin: number;
  maintenanceInterval: number;
  standbyTime: number;
  energyConsumption: number;
}

export interface MachineAnalysisResponse {
  efficiencyScore: number;
  efficiencyStatus: string;
  // Bazı backend serializasyon senaryolarına karşı tolerans:
  EfficiencyScore?: number;
  EfficiencyStatus?: string;
}

export interface FullAnalysisResponse {
  machineName: string;
  fuzzyResult: MachineAnalysisResponse;
  totalCost: number;
  calculatedDays: number;
  isDeadlineMet: boolean;
  costDetails: string;
}

export interface SimulationRequest {
  machineId: Id;
  targetProduction: number;
  deadlineDays: number;
  electricityCost: number;
  laborCostPerHour: number;
  maintenanceCostPerSession: number;
}

export interface MachineComparisonRequest {
  machineIds: Id[];
  comparisonFactors: string[];
  includeHistoricalData: boolean;
  historicalMonths: number;
}

export interface MachineComparisonItem {
  machineId: Id;
  machineName: string;
  factorScores: Record<string, number>;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
}

export interface ComparisonChart {
  chartType: string;
  title: string;
  labels: string[];
  datasets: ChartDataset[];
}

export interface MachineComparisonResponse {
  comparisonResults: MachineComparisonItem[];
  bestOverallPerformer?: MachineComparisonItem;
  bestPerFactorPerformers?: Record<string, MachineComparisonItem>;
  charts: ComparisonChart[];
}

export interface MaintenanceTask {
  name: string;
  description: string;
  estimatedHours: number;
  priority: string;
  requiredResources: string[];
}

export interface MaintenancePlanRequest {
  startDate: string; // YYYY-MM-DD
  durationMonths: number;
  frequency: string;
  includeWeekends: boolean;
  tasks: MaintenanceTask[];
}

export interface ScheduledMaintenance {
  date: string; // YYYY-MM-DD
  tasks: MaintenanceTask[];
  totalDuration: number;
  status: string;
}

export interface MaintenancePlanResponse {
  machineId: Id;
  machineName: string;
  scheduledMaintenances: ScheduledMaintenance[];
  totalMaintenanceHours: number;
  estimatedCost: number;
  nextMaintenanceDate: string;
}

export interface OptimizationSuggestion {
  parameter: string;
  currentValue: number;
  suggestedValue: number;
  potentialImprovementPercentage: number;
  reasonForSuggestion: string;
  implementationDifficulty: string;
  estimatedCostOfImplementation: number;
}

export interface OptimizedState {
  potentialEfficiencyScore: number;
  potentialEfficiencyStatus: string;
  improvementPercentage: number;
  estimatedCostSavings: number;
  estimatedImplementationDays: number;
}

export interface OptimizationResponse {
  machineId: Id;
  machineName: string;
  currentEfficiencyScore: number;
  suggestions: OptimizationSuggestion[];
  potentialOptimizedState: OptimizedState;
}

export interface ProductionTargetRequest {
  dailyProductionTarget: number;
  deadlineDays: number;
  maxBudget: number;
  prioritizeQuality: boolean;
  prioritizeSpeed: boolean;
  prioritizeEnergySaving: boolean;
}

export interface MachineRecommendationDto {
  machineId: Id;
  machineName: string;
  efficiencyScore: number;
  matchScore: number;
  withinBudget: boolean;
  estimatedCost: number;
  canMeetDeadline: boolean;
  estimatedDaysToComplete: number;
  strengths: string[];
  limitations: string[];
}

export interface ChartData {
  label: string;
  value: number;
}

export interface MachineStatisticsDto {
  totalMachines: number;
  averageEfficiencyScore: number;
  mostEfficientMachine?: MachineDto;
  leastEfficientMachine?: MachineDto;
  efficiencyDistribution: Record<string, number>;
  averageMaintenanceInterval: number;
  averageEnergyConsumption: number;
  efficiencyTrendByMonth: ChartData[];
  productionVsEfficiency: ChartData[];
}

export interface ImportResponse {
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  importedMachines: MachineDto[];
}

// Spring Page<T> (paged endpoint)
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number;
  first: boolean;
  last: boolean;
}
