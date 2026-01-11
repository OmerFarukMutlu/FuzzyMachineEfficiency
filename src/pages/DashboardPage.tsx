import { useEffect, useState } from "react";
import { MachinesAPI } from "../api/machines";
import { getErrorMessage } from "../api/http";
import type { MachineStatisticsDto } from "../types/dto";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import { fmtNumber } from "../utils/format";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<MachineStatisticsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const s = await MachinesAPI.statistics();
        setData(s);
      } catch (e) {
        setErr(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading && !data) return <Loading />;
  if (err && !data) return <ErrorBox message={err} />;
  if (!data) return <ErrorBox message="No statistics." />;

  const distRows = Object.entries(data.efficiencyDistribution ?? {}).map(([k, v]) => ({ label: k, value: v }));
  const trendRows = (data.efficiencyTrendByMonth ?? []).map((x) => ({ label: x.label, value: x.value }));

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Dashboard</h1>

      {loading ? <Loading /> : null}
      {err ? <ErrorBox message={err} /> : null}

      <div style={grid3}>
        <div style={card}>
          <div style={kpiTitle}>Total Machines</div>
          <div style={kpiValue}>{data.totalMachines}</div>
        </div>
        <div style={card}>
          <div style={kpiTitle}>Avg Efficiency</div>
          <div style={kpiValue}>{fmtNumber(data.averageEfficiencyScore)}</div>
        </div>
        <div style={card}>
          <div style={kpiTitle}>Avg Energy</div>
          <div style={kpiValue}>{fmtNumber(data.averageEnergyConsumption)}</div>
        </div>
      </div>

      <div style={grid2}>
        <div style={card}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Efficiency Distribution</div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={distRows}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={card}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Efficiency Trend</div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={trendRows}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <div>
            <b>Most Efficient:</b>{" "}
            {data.mostEfficientMachine ? `${data.mostEfficientMachine.name} (id=${data.mostEfficientMachine.id})` : "-"}
          </div>
          <div>
            <b>Least Efficient:</b>{" "}
            {data.leastEfficientMachine ? `${data.leastEfficientMachine.name} (id=${data.leastEfficientMachine.id})` : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { border: "1px solid #eee", borderRadius: 12, padding: 12 };
const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 };
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const kpiTitle: React.CSSProperties = { fontSize: 12, color: "#666" };
const kpiValue: React.CSSProperties = { fontSize: 28, fontWeight: 800, marginTop: 6 };
