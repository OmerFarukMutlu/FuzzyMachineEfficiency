import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import MachinesPage from "./pages/MachinesPage";
import MachineDetailPage from "./pages/MachineDetailPage";
import MachineFormPage from "./pages/MachineFormPage";
import SimulationPage from "./pages/SimulationPage";
import ComparisonPage from "./pages/ComparisonPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import DashboardPage from "./pages/DashboardPage";
import MaintenancePlanPage from "./pages/MaintenancePlanPage";
import ImportExportPage from "./pages/ImportExportPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/machines" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/machines" element={<MachinesPage />} />
        <Route path="/machines/new" element={<MachineFormPage mode="create" />} />
        <Route path="/machines/:id" element={<MachineDetailPage />} />
        <Route path="/machines/:id/edit" element={<MachineFormPage mode="edit" />} />
        <Route path="/simulate" element={<SimulationPage />} />
        <Route path="/compare" element={<ComparisonPage />} />
        <Route path="/recommend" element={<RecommendationsPage />} />
        <Route path="/maintenance/:id" element={<MaintenancePlanPage />} />
        <Route path="/import-export" element={<ImportExportPage />} />
      </Route>
    </Routes>
  );
}
