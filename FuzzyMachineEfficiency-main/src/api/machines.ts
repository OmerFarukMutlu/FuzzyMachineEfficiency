import { http } from "./http";
import type {
  MachineDto,
  MachineAnalysisResponse,
  FullAnalysisResponse,
  SimulationRequest,
  MachineComparisonRequest,
  MachineComparisonResponse,
  MaintenancePlanRequest,
  MaintenancePlanResponse,
  OptimizationResponse,
  ProductionTargetRequest,
  MachineRecommendationDto,
  MachineStatisticsDto,
  ImportResponse,
  Page,
  Id,
} from "../types/dto";

const base = "/api/machines";

export const MachinesAPI = {
  // CRUD
  async add(machine: MachineDto) {
    const { data } = await http.post<MachineDto>(`${base}/add`, machine);
    return data;
  },
  async all() {
    const { data } = await http.get<MachineDto[]>(base);
    return data;
  },
  async get(id: Id) {
    const { data } = await http.get<MachineDto>(`${base}/${id}`);
    return data;
  },
  async update(id: Id, machine: MachineDto) {
    const { data } = await http.put<MachineDto>(`${base}/${id}`, machine);
    return data;
  },
  async remove(id: Id) {
    const { data } = await http.delete(`${base}/${id}`);
    return data;
  },

  // Paged / Search / Filter
  async paged(params: { page: number; size: number; sortBy?: string; direction?: "asc" | "desc" }) {
    const { data } = await http.get<Page<MachineDto>>(`${base}/paged`, { params });
    return data;
  },
  async search(name: string) {
    const { data } = await http.get<MachineDto[]>(`${base}/search`, { params: { name } });
    return data;
  },
  async filter(minEfficiency?: number, maxEfficiency?: number) {
    const params: any = {};
    if (minEfficiency !== undefined) params.minEfficiency = minEfficiency;
    if (maxEfficiency !== undefined) params.maxEfficiency = maxEfficiency;
    const { data } = await http.get<MachineDto[]>(`${base}/filter`, { params });
    return data;
  },

  // Analysis / Simulation
  async efficiencyAnalysis(id: Id) {
    const { data } = await http.get<MachineAnalysisResponse>(`${base}/${id}/efficiency-analysis`);
    return normalizeAnalysis(data);
  },
  async simulate(req: SimulationRequest) {
    const { data } = await http.post<FullAnalysisResponse>(`${base}/simulate`, req);
    // normalize nested fuzzyResult too:
    return { ...data, fuzzyResult: normalizeAnalysis(data.fuzzyResult) };
  },

  // Compare
  async compare(req: MachineComparisonRequest) {
    const { data } = await http.post<MachineComparisonResponse>(`${base}/compare`, req);
    return data;
  },

  // Maintenance Plan
  async maintenancePlan(id: Id, req: MaintenancePlanRequest) {
    const { data } = await http.post<MaintenancePlanResponse>(`${base}/${id}/maintenance-plan`, req);
    return data;
  },

  // Optimization
  async optimization(id: Id) {
    const { data } = await http.get<OptimizationResponse>(`${base}/${id}/optimization-suggestions`);
    return data;
  },

  // Recommend
  async recommend(req: ProductionTargetRequest) {
    const { data } = await http.post<MachineRecommendationDto[]>(`${base}/recommend`, req);
    return data;
  },

  // Reports
  async topPerformers(limit = 5) {
    const { data } = await http.get<MachineDto[]>(`${base}/top-performers`, { params: { limit } });
    return data;
  },
  async needsImprovement() {
    const { data } = await http.get<MachineDto[]>(`${base}/needs-improvement`);
    return data;
  },
  async statistics() {
    const { data } = await http.get<MachineStatisticsDto>(`${base}/statistics`);
    return data;
  },

  // CSV import/export (endpoint adı excel, içerik csv)
  exportCsvUrl() {
    // download link for browser
    return `${http.defaults.baseURL}${base}/export/excel`;
  },
  async importCsv(file: File) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await http.post<ImportResponse>(`${base}/import/excel`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

function normalizeAnalysis(a: any): MachineAnalysisResponse {
  if (!a) return a;
  const efficiencyScore = a.efficiencyScore ?? a.EfficiencyScore ?? 0;
  const efficiencyStatus = a.efficiencyStatus ?? a.EfficiencyStatus ?? "";
  return { ...a, efficiencyScore, efficiencyStatus };
}
