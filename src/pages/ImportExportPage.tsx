import { useState } from "react";
import { MachinesAPI } from "../api/machines";
import { getErrorMessage } from "../api/http";
import type { ImportResponse } from "../types/dto";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";

export default function ImportExportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [res, setRes] = useState<ImportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function upload() {
    setLoading(true);
    setErr("");
    setRes(null);
    try {
      if (!file) throw new Error("Select a CSV file.");
      const out = await MachinesAPI.importCsv(file);
      setRes(out);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Import / Export</h1>

      {loading ? <Loading /> : null}
      {err ? <ErrorBox message={err} /> : null}

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Export</h3>
        <a href={MachinesAPI.exportCsvUrl()} target="_blank" rel="noreferrer">
          Download CSV
        </a>
        <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
          Endpoint adı “excel” olsa da içerik CSV.
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Import (CSV)</h3>
        <input type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div style={{ marginTop: 10 }}>
          <button onClick={upload} disabled={!file || loading}>Upload</button>
        </div>

        {res ? (
          <div style={{ marginTop: 12 }}>
            <div><b>Total:</b> {res.totalRecords}</div>
            <div><b>Success:</b> {res.successfulImports}</div>
            <div><b>Failed:</b> {res.failedImports}</div>

            {res.errors?.length ? (
              <div style={{ marginTop: 10 }}>
                <b>Errors</b>
                <ul>
                  {res.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const card: React.CSSProperties = { border: "1px solid #eee", borderRadius: 12, padding: 12 };
