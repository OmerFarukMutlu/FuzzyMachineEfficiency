import { useState } from "react";
import { MachinesAPI } from "../api/machines";
import { getErrorMessage } from "../api/http";
import type { MachineRecommendationDto, ProductionTargetRequest } from "../types/dto";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import Field from "../components/Field";
import { fmtNumber } from "../utils/format";

export default function RecommendationsPage() {
  const [req, setReq] = useState<ProductionTargetRequest>({
    dailyProductionTarget: 150,
    deadlineDays: 10,
    maxBudget: 50000,
    prioritizeQuality: true,
    prioritizeSpeed: false,
    prioritizeEnergySaving: true,
  });

  const [list, setList] = useState<MachineRecommendationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true);
    setErr("");
    try {
      const res = await MachinesAPI.recommend(req);
      setList(res);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Recommendations</h1>

      {loading ? <Loading /> : null}
      {err ? <ErrorBox message={err} /> : null}

      <div style={card}>
        <div style={grid}>
          <Field label="Daily Production Target">
            <input type="number" value={req.dailyProductionTarget}
              onChange={(e) => setReq((p) => ({ ...p, dailyProductionTarget: Number(e.target.value) }))} />
          </Field>

          <Field label="Deadline Days">
            <input type="number" value={req.deadlineDays}
              onChange={(e) => setReq((p) => ({ ...p, deadlineDays: Number(e.target.value) }))} />
          </Field>

          <Field label="Max Budget">
            <input type="number" value={req.maxBudget}
              onChange={(e) => setReq((p) => ({ ...p, maxBudget: Number(e.target.value) }))} />
          </Field>

          <Field label="Prioritize Quality">
            <select value={String(req.prioritizeQuality)} onChange={(e) => setReq((p) => ({ ...p, prioritizeQuality: e.target.value === "true" }))}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </Field>

          <Field label="Prioritize Speed">
            <select value={String(req.prioritizeSpeed)} onChange={(e) => setReq((p) => ({ ...p, prioritizeSpeed: e.target.value === "true" }))}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </Field>

          <Field label="Prioritize Energy Saving">
            <select value={String(req.prioritizeEnergySaving)} onChange={(e) => setReq((p) => ({ ...p, prioritizeEnergySaving: e.target.value === "true" }))}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </Field>
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={run} disabled={loading}>Get Recommendations</button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {list.map((r) => (
          <div key={r.machineId} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700 }}>{r.machineName} (id={r.machineId})</div>
              <div><b>Match:</b> {fmtNumber(r.matchScore)}</div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <span style={badge(r.canMeetDeadline)}>{r.canMeetDeadline ? "Deadline OK" : "Deadline Risk"}</span>
              <span style={badge(r.withinBudget)}>{r.withinBudget ? "Budget OK" : "Over Budget"}</span>
              <span style={badge(true)}>Eff {fmtNumber(r.efficiencyScore)}</span>
              <span style={badge(true)}>Cost {fmtNumber(r.estimatedCost)}</span>
              <span style={badge(true)}>Days {fmtNumber(r.estimatedDaysToComplete, 0)}</span>
            </div>

            <div style={{ marginTop: 10 }}>
              <b>Strengths:</b> {r.strengths?.length ? r.strengths.join(", ") : "-"}
              <br />
              <b>Limitations:</b> {r.limitations?.length ? r.limitations.join(", ") : "-"}
            </div>
          </div>
        ))}
        {list.length === 0 ? <div style={{ color: "#666" }}>No recommendations yet.</div> : null}
      </div>
    </div>
  );
}

const card: React.CSSProperties = { border: "1px solid #eee", borderRadius: 12, padding: 12 };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 };

const badge = (ok: boolean): React.CSSProperties => ({
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #ddd",
  background: ok ? "#f6ffed" : "#fff1f0",
});
