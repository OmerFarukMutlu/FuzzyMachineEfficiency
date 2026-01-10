import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MachinesAPI } from "../api/machines";
import { getErrorMessage } from "../api/http";
import type { MaintenancePlanRequest, MaintenancePlanResponse, MaintenanceTask, MachineDto } from "../types/dto";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import Field from "../components/Field";
import { toDateInputValue, fmtNumber } from "../utils/format";

export default function MaintenancePlanPage() {
  const { id } = useParams();
  const machineId = Number(id);

  const [machine, setMachine] = useState<MachineDto | null>(null);
  const [req, setReq] = useState<MaintenancePlanRequest>({
    startDate: toDateInputValue(new Date()),
    durationMonths: 6,
    frequency: "MONTHLY",
    includeWeekends: false,
    tasks: [
      {
        name: "General Check",
        description: "Standard inspection",
        estimatedHours: 2,
        priority: "MEDIUM",
        requiredResources: ["Toolkit"],
      },
    ],
  });

  const [res, setRes] = useState<MaintenancePlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const m = await MachinesAPI.get(machineId);
        setMachine(m);
      } catch (e) {
        setErr(getErrorMessage(e));
      }
    })();
  }, [machineId]);

  function updateTask(i: number, patch: Partial<MaintenanceTask>) {
    setReq((p) => ({
      ...p,
      tasks: p.tasks.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    }));
  }

  function addTask() {
    setReq((p) => ({
      ...p,
      tasks: [
        ...p.tasks,
        { name: "", description: "", estimatedHours: 1, priority: "LOW", requiredResources: [] },
      ],
    }));
  }

  function removeTask(i: number) {
    setReq((p) => ({ ...p, tasks: p.tasks.filter((_, idx) => idx !== i) }));
  }

  async function run() {
    setLoading(true);
    setErr("");
    setRes(null);
    try {
      const out = await MachinesAPI.maintenancePlan(machineId, req);
      setRes(out);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Maintenance Plan {machine ? `- ${machine.name}` : ""}</h1>

      {loading ? <Loading /> : null}
      {err ? <ErrorBox message={err} /> : null}

      <div style={card}>
        <div style={grid}>
          <Field label="Start Date (YYYY-MM-DD)">
            <input value={req.startDate} onChange={(e) => setReq((p) => ({ ...p, startDate: e.target.value }))} />
          </Field>

          <Field label="Duration (Months)">
            <input type="number" value={req.durationMonths}
              onChange={(e) => setReq((p) => ({ ...p, durationMonths: Number(e.target.value) }))} />
          </Field>

          <Field label="Frequency">
            <input value={req.frequency} onChange={(e) => setReq((p) => ({ ...p, frequency: e.target.value }))} />
          </Field>

          <Field label="Include Weekends">
            <select value={String(req.includeWeekends)} onChange={(e) => setReq((p) => ({ ...p, includeWeekends: e.target.value === "true" }))}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </Field>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b>Tasks</b>
            <button onClick={addTask}>+ Add Task</button>
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            {req.tasks.map((t, i) => (
              <div key={i} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <b>Task #{i + 1}</b>
                  <button onClick={() => removeTask(i)} disabled={req.tasks.length <= 1}>Remove</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
                  <Field label="Name">
                    <input value={t.name} onChange={(e) => updateTask(i, { name: e.target.value })} />
                  </Field>
                  <Field label="Priority">
                    <input value={t.priority} onChange={(e) => updateTask(i, { priority: e.target.value })} />
                  </Field>
                  <Field label="Estimated Hours">
                    <input type="number" value={t.estimatedHours} onChange={(e) => updateTask(i, { estimatedHours: Number(e.target.value) })} />
                  </Field>
                  <Field label="Required Resources (comma separated)">
                    <input
                      value={(t.requiredResources ?? []).join(",")}
                      onChange={(e) => updateTask(i, { requiredResources: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                    />
                  </Field>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Field label="Description">
                      <input value={t.description} onChange={(e) => updateTask(i, { description: e.target.value })} />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={run} disabled={loading}>Create Plan</button>
          </div>
        </div>
      </div>

      {res ? (
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Plan Result</h3>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div><b>Total Hours:</b> {fmtNumber(res.totalMaintenanceHours)}</div>
            <div><b>Estimated Cost:</b> {fmtNumber(res.estimatedCost)}</div>
            <div><b>Next Maintenance:</b> {res.nextMaintenanceDate}</div>
          </div>

          <div style={{ marginTop: 10, border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={th}>Date</th>
                  <th style={th}>Status</th>
                  <th style={th}>Duration</th>
                  <th style={th}>Tasks</th>
                </tr>
              </thead>
              <tbody>
                {res.scheduledMaintenances.map((s, idx) => (
                  <tr key={idx} style={{ borderTop: "1px solid #eee" }}>
                    <td style={td}>{s.date}</td>
                    <td style={td}>{s.status}</td>
                    <td style={td}>{fmtNumber(s.totalDuration, 0)}</td>
                    <td style={td}>{s.tasks.map(t => t.name).join(", ")}</td>
                  </tr>
                ))}
                {res.scheduledMaintenances.length === 0 ? (
                  <tr><td style={{ padding: 10 }} colSpan={4}>No schedule returned.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const card: React.CSSProperties = { border: "1px solid #eee", borderRadius: 12, padding: 12 };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 820 };
const th: React.CSSProperties = { textAlign: "left", padding: 10, fontSize: 12, color: "#444" };
const td: React.CSSProperties = { padding: 10, fontSize: 13 };
