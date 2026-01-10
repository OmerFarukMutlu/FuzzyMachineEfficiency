import { useEffect, useMemo, useState } from "react";
import { MachinesAPI } from "../api/machines";
import { getErrorMessage } from "../api/http";
import type { MachineComparisonRequest, MachineComparisonResponse, MachineDto } from "../types/dto";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import { ComparisonChartView } from "../components/Charts";
import Field from "../components/Field";
import { fmtNumber } from "../utils/format";

const FACTORS = [
  "dailyProduction",
  "errorMargin",
  "maintenanceInterval",
  "standbyTime",
  "energyConsumption",
  "efficiencyScore",
];

export default function ComparisonPage() {
  const [machines, setMachines] = useState<MachineDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedFactors, setSelectedFactors] = useState<string[]>(["dailyProduction", "errorMargin", "energyConsumption"]);

  const [req, setReq] = useState<Omit<MachineComparisonRequest, "machineIds" | "comparisonFactors">>({
    includeHistoricalData: false,
    historicalMonths: 6,
  });

  const [res, setRes] = useState<MachineComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const ms = await MachinesAPI.all();
        setMachines(ms);
        setSelectedIds(ms.slice(0, 3).map((m) => m.id!).filter(Boolean));
      } catch (e) {
        setErr(getErrorMessage(e));
      }
    })();
  }, []);

  const canRun = useMemo(() => selectedIds.length >= 2 && selectedFactors.length >= 1, [selectedIds, selectedFactors]);

  async function run() {
    setLoading(true);
    setErr("");
    setRes(null);
    try {
      if (!canRun) throw new Error("Select at least 2 machines and 1 factor.");
      const payload: MachineComparisonRequest = {
        machineIds: selectedIds,
        comparisonFactors: selectedFactors,
        includeHistoricalData: req.includeHistoricalData,
        historicalMonths: req.historicalMonths,
      };
      const out = await MachinesAPI.compare(payload);
      setRes(out);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function toggleId(id: number) {
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }
  function toggleFactor(f: string) {
    setSelectedFactors((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Comparison</h1>

      {loading ? <Loading /> : null}
      {err ? <ErrorBox message={err} /> : null}

      <div style={card}>
        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <b>Select Machines</b>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {machines.map((m) => (
                <label key={m.id} style={chip(selectedIds.includes(m.id!))}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(m.id!)}
                    onChange={() => toggleId(m.id!)}
                    style={{ marginRight: 8 }}
                  />
                  {m.name} (id={m.id})
                </label>
              ))}
            </div>
          </div>

          <div>
            <b>Select Factors</b>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {FACTORS.map((f) => (
                <label key={f} style={chip(selectedFactors.includes(f))}>
                  <input
                    type="checkbox"
                    checked={selectedFactors.includes(f)}
                    onChange={() => toggleFactor(f)}
                    style={{ marginRight: 8 }}
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 560 }}>
            <Field label="Include Historical Data">
              <select
                value={String(req.includeHistoricalData)}
                onChange={(e) => setReq((p) => ({ ...p, includeHistoricalData: e.target.value === "true" }))}
              >
                <option value="false">false</option>
                <option value="true">true</option>
              </select>
            </Field>

            <Field label="Historical Months">
              <input
                type="number"
                value={req.historicalMonths}
                onChange={(e) => setReq((p) => ({ ...p, historicalMonths: Number(e.target.value) }))}
              />
            </Field>
          </div>

          <button onClick={run} disabled={!canRun || loading}>Run Comparison</button>
        </div>
      </div>

      {res ? (
        <>
          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={th}>Machine</th>
                    <th style={th}>Overall</th>
                    <th style={th}>Strengths</th>
                    <th style={th}>Weaknesses</th>
                  </tr>
                </thead>
                <tbody>
                  {res.comparisonResults.map((r) => (
                    <tr key={r.machineId} style={{ borderTop: "1px solid #eee" }}>
                      <td style={td}>{r.machineName} (id={r.machineId})</td>
                      <td style={td}>{fmtNumber(r.overallScore)}</td>
                      <td style={td}>{r.strengths?.join(", ")}</td>
                      <td style={td}>{r.weaknesses?.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {res.bestOverallPerformer ? (
              <div style={{ marginTop: 10 }}>
                <b>Best overall:</b> {res.bestOverallPerformer.machineName} (score {fmtNumber(res.bestOverallPerformer.overallScore)})
              </div>
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {res.charts?.map((c, idx) => (
              <ComparisonChartView key={idx} chart={c} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

const card: React.CSSProperties = { border: "1px solid #eee", borderRadius: 12, padding: 12 };
const th: React.CSSProperties = { textAlign: "left", padding: 10, fontSize: 12, color: "#444" };
const td: React.CSSProperties = { padding: 10, fontSize: 13 };
const chip = (active: boolean): React.CSSProperties => ({
  border: "1px solid #ddd",
  borderRadius: 999,
  padding: "6px 10px",
  background: active ? "#111" : "#fff",
  color: active ? "#fff" : "#111",
  cursor: "pointer",
  userSelect: "none",
});
