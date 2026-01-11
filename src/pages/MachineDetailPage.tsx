import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MachinesAPI } from "../api/machines";
import { getErrorMessage } from "../api/http";
import type { MachineDto, MachineAnalysisResponse, OptimizationResponse } from "../types/dto";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import ConfirmButton from "../components/ConfirmButton";
import { fmtNumber } from "../utils/format";

export default function MachineDetailPage() {
  const { id } = useParams();
  const machineId = Number(id);
  const nav = useNavigate();

  const [m, setM] = useState<MachineDto | null>(null);
  const [analysis, setAnalysis] = useState<MachineAnalysisResponse | null>(null);
  const [opt, setOpt] = useState<OptimizationResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      const [machine, a, o] = await Promise.all([
        MachinesAPI.get(machineId),
        MachinesAPI.efficiencyAnalysis(machineId),
        MachinesAPI.optimization(machineId),
      ]);
      setM(machine);
      setAnalysis(a);
      setOpt(o);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(machineId)) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineId]);

  async function doDelete() {
    setLoading(true);
    setErr("");
    try {
      await MachinesAPI.remove(machineId);
      nav("/machines");
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  if (loading && !m) return <Loading />;
  if (err && !m) return <ErrorBox message={err} />;
  if (!m) return <ErrorBox message="Machine not found." />;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>{m.name}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to={`/machines/${machineId}/edit`}>Edit</Link>
          <ConfirmButton onConfirm={doDelete} confirmText="Delete this machine?">Delete</ConfirmButton>
        </div>
      </div>

      {loading ? <Loading /> : null}
      {err ? <ErrorBox message={err} /> : null}

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Machine Parameters</h3>
        <div style={grid2}>
          <div><b>Daily Production:</b> {fmtNumber(m.dailyProduction)}</div>
          <div><b>Error Margin (%):</b> {fmtNumber(m.errorMargin)}</div>
          <div><b>Maintenance Interval:</b> {fmtNumber(m.maintenanceInterval)}</div>
          <div><b>Standby Time:</b> {fmtNumber(m.standbyTime)}</div>
          <div><b>Energy Consumption:</b> {fmtNumber(m.energyConsumption)}</div>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Efficiency Analysis</h3>
        {analysis ? (
          <div style={grid2}>
            <div><b>Score:</b> {fmtNumber(analysis.efficiencyScore)}</div>
            <div><b>Status:</b> {analysis.efficiencyStatus}</div>
          </div>
        ) : (
          <div>No analysis.</div>
        )}
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Optimization</h3>
        {opt ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={grid2}>
              <div><b>Current Score:</b> {fmtNumber(opt.currentEfficiencyScore)}</div>
              <div><b>Potential Score:</b> {fmtNumber(opt.potentialOptimizedState.potentialEfficiencyScore)}</div>
              <div><b>Potential Status:</b> {opt.potentialOptimizedState.potentialEfficiencyStatus}</div>
              <div><b>Improvement %:</b> {fmtNumber(opt.potentialOptimizedState.improvementPercentage)}</div>
              <div><b>Cost Savings:</b> {fmtNumber(opt.potentialOptimizedState.estimatedCostSavings)}</div>
              <div><b>Implementation Days:</b> {fmtNumber(opt.potentialOptimizedState.estimatedImplementationDays, 0)}</div>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 10 }}>
              <b>Suggestions</b>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={th}>Parameter</th>
                    <th style={th}>Current</th>
                    <th style={th}>Suggested</th>
                    <th style={th}>Potential %</th>
                    <th style={th}>Difficulty</th>
                    <th style={th}>Est. Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {opt.suggestions.map((s, idx) => (
                    <tr key={idx} style={{ borderTop: "1px solid #eee" }}>
                      <td style={td}>{s.parameter}</td>
                      <td style={td}>{fmtNumber(s.currentValue)}</td>
                      <td style={td}>{fmtNumber(s.suggestedValue)}</td>
                      <td style={td}>{fmtNumber(s.potentialImprovementPercentage)}</td>
                      <td style={td}>{s.implementationDifficulty}</td>
                      <td style={td}>{fmtNumber(s.estimatedCostOfImplementation)}</td>
                    </tr>
                  ))}
                  {opt.suggestions.length === 0 ? (
                    <tr><td style={{ padding: 10 }} colSpan={6}>No suggestions.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>No optimization response.</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link to="/simulate">Go to Simulation</Link>
        <Link to={`/maintenance/${machineId}`}>Create Maintenance Plan</Link>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { border: "1px solid #eee", borderRadius: 12, padding: 12 };
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
const th: React.CSSProperties = { textAlign: "left", padding: 10, fontSize: 12, color: "#444" };
const td: React.CSSProperties = { padding: 10, fontSize: 13 };
