import { useEffect, useState } from "react";
import { MachinesAPI } from "../api/machines";
import { getErrorMessage } from "../api/http";
import type { FullAnalysisResponse, MachineDto, SimulationRequest } from "../types/dto";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import Field from "../components/Field";
import { fmtNumber } from "../utils/format";

export default function SimulationPage() {
  const [machines, setMachines] = useState<MachineDto[]>([]);
  const [req, setReq] = useState<SimulationRequest>({
    machineId: 0,
    targetProduction: 1000,
    deadlineDays: 10,
    electricityCost: 2.5,
    laborCostPerHour: 150,
    maintenanceCostPerSession: 500,
  });

  const [res, setRes] = useState<FullAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const ms = await MachinesAPI.all();
        setMachines(ms);
        if (ms[0]?.id) setReq((p) => ({ ...p, machineId: ms[0].id! }));
      } catch (e) {
        setErr(getErrorMessage(e));
      }
    })();
  }, []);

  async function run() {
    setLoading(true);
    setErr("");
    setRes(null);
    try {
      if (!req.machineId) throw new Error("Select a machine.");
      const out = await MachinesAPI.simulate(req);
      setRes(out);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 860 }}>
      <h1 style={{ margin: 0 }}>Simulation</h1>

      {loading ? <Loading /> : null}
      {err ? <ErrorBox message={err} /> : null}

      <div style={card}>
        <div style={grid}>
          <Field label="Machine">
            <select value={req.machineId} onChange={(e) => setReq((p) => ({ ...p, machineId: Number(e.target.value) }))}>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>{m.name} (id={m.id})</option>
              ))}
            </select>
          </Field>

          <Field label="Target Production">
            <input type="number" value={req.targetProduction}
              onChange={(e) => setReq((p) => ({ ...p, targetProduction: Number(e.target.value) }))} />
          </Field>

          <Field label="Deadline Days">
            <input type="number" value={req.deadlineDays}
              onChange={(e) => setReq((p) => ({ ...p, deadlineDays: Number(e.target.value) }))} />
          </Field>

          <Field label="Electricity Cost">
            <input type="number" value={req.electricityCost}
              onChange={(e) => setReq((p) => ({ ...p, electricityCost: Number(e.target.value) }))} />
          </Field>

          <Field label="Labor Cost / Hour">
            <input type="number" value={req.laborCostPerHour}
              onChange={(e) => setReq((p) => ({ ...p, laborCostPerHour: Number(e.target.value) }))} />
          </Field>

          <Field label="Maintenance Cost / Session">
            <input type="number" value={req.maintenanceCostPerSession}
              onChange={(e) => setReq((p) => ({ ...p, maintenanceCostPerSession: Number(e.target.value) }))} />
          </Field>
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={run} disabled={loading}>Run Simulation</button>
        </div>
      </div>

      {res ? (
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Result</h3>
          <div style={grid2}>
            <div><b>Machine:</b> {res.machineName}</div>
            <div><b>Deadline Met:</b> {String(res.isDeadlineMet)}</div>
            <div><b>Calculated Days:</b> {fmtNumber(res.calculatedDays)}</div>
            <div><b>Total Cost:</b> {fmtNumber(res.totalCost)}</div>
            <div><b>Efficiency Score:</b> {fmtNumber(res.fuzzyResult.efficiencyScore)}</div>
            <div><b>Status:</b> {res.fuzzyResult.efficiencyStatus}</div>
          </div>

          <div style={{ marginTop: 10 }}>
            <b>Cost Details</b>
            <pre style={{ whiteSpace: "pre-wrap", border: "1px solid #eee", padding: 10, borderRadius: 10 }}>
              {res.costDetails}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const card: React.CSSProperties = { border: "1px solid #eee", borderRadius: 12, padding: 12 };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
