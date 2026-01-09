import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MachinesAPI } from "../api/machines";
import { getErrorMessage } from "../api/http";
import type { MachineDto } from "../types/dto";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import Field from "../components/Field";

export default function MachineFormPage({ mode }: { mode: "create" | "edit" }) {
  const nav = useNavigate();
  const { id } = useParams();
  const machineId = Number(id);

  const [form, setForm] = useState<MachineDto>({
    name: "",
    dailyProduction: 0,
    errorMargin: 0,
    maintenanceInterval: 0,
    standbyTime: 0,
    energyConsumption: 0,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (mode !== "edit") return;
    if (!Number.isFinite(machineId)) return;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const m = await MachinesAPI.get(machineId);
        setForm({
          name: m.name,
          dailyProduction: m.dailyProduction,
          errorMargin: m.errorMargin,
          maintenanceInterval: m.maintenanceInterval,
          standbyTime: m.standbyTime,
          energyConsumption: m.energyConsumption,
        });
      } catch (e) {
        setErr(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, machineId]);

  function set<K extends keyof MachineDto>(k: K, v: MachineDto[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Name is required.";
    const nums: Array<[string, number]> = [
      ["dailyProduction", form.dailyProduction],
      ["errorMargin", form.errorMargin],
      ["maintenanceInterval", form.maintenanceInterval],
      ["standbyTime", form.standbyTime],
      ["energyConsumption", form.energyConsumption],
    ];
    for (const [k, v] of nums) {
      if (!Number.isFinite(v)) return `${k} must be a number.`;
      if (v < 0) return `${k} cannot be negative.`;
    }
    return null;
  }

  async function onSave() {
    const msg = validate();
    if (msg) {
      setErr(msg);
      return;
    }

    setLoading(true);
    setErr("");
    try {
      if (mode === "create") {
        const created = await MachinesAPI.add(form);
        nav(`/machines/${created.id}`);
      } else {
        await MachinesAPI.update(machineId, form);
        nav(`/machines/${machineId}`);
      }
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
      <h1 style={{ margin: 0 }}>{mode === "create" ? "Add Machine" : "Edit Machine"}</h1>

      {loading ? <Loading /> : null}
      {err ? <ErrorBox message={err} /> : null}

      <div style={card}>
        <div style={grid}>
          <Field label="Name">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>

          <Field label="Daily Production">
            <input type="number" value={form.dailyProduction}
              onChange={(e) => set("dailyProduction", Number(e.target.value))} />
          </Field>

          <Field label="Error Margin (%)">
            <input type="number" value={form.errorMargin}
              onChange={(e) => set("errorMargin", Number(e.target.value))} />
          </Field>

          <Field label="Maintenance Interval">
            <input type="number" value={form.maintenanceInterval}
              onChange={(e) => set("maintenanceInterval", Number(e.target.value))} />
          </Field>

          <Field label="Standby Time">
            <input type="number" value={form.standbyTime}
              onChange={(e) => set("standbyTime", Number(e.target.value))} />
          </Field>

          <Field label="Energy Consumption">
            <input type="number" value={form.energyConsumption}
              onChange={(e) => set("energyConsumption", Number(e.target.value))} />
          </Field>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <button onClick={onSave} disabled={loading}>
            {mode === "create" ? "Create" : "Save"}
          </button>
          <button onClick={() => nav(-1)} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { border: "1px solid #eee", borderRadius: 12, padding: 12 };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
