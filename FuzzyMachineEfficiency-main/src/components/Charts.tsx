import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import type { ComparisonChart } from "../types/dto";

export function ComparisonChartView({ chart }: { chart: ComparisonChart }) {
  // Recharts format: array of rows, each row has label + datasetLabel fields
  const rows = chart.labels.map((lbl, i) => {
    const r: any = { label: lbl };
    for (const ds of chart.datasets) r[ds.label] = ds.data[i] ?? 0;
    return r;
  });

  const type = (chart.chartType ?? "").toLowerCase();

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{chart.title}</div>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          {type.includes("line") ? (
            <LineChart data={rows}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.datasets.map((ds) => (
                <Line key={ds.label} type="monotone" dataKey={ds.label} dot={false} />
              ))}
            </LineChart>
          ) : type.includes("radar") ? (
            <RadarChart data={rows}>
              <PolarGrid />
              <PolarAngleAxis dataKey="label" />
              <PolarRadiusAxis />
              <Tooltip />
              <Legend />
              {chart.datasets.map((ds) => (
                <Radar key={ds.label} dataKey={ds.label} fillOpacity={0.2} />
              ))}
            </RadarChart>
          ) : (
            <BarChart data={rows}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.datasets.map((ds) => (
                <Bar key={ds.label} dataKey={ds.label} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
