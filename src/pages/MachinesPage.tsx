import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MachinesAPI } from "../api/machines";
import { getErrorMessage } from "../api/http";
import type { MachineDto, Page } from "../types/dto";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import Paginator from "../components/Paginator";
import { fmtNumber } from "../utils/format";

export default function MachinesPage() {
  const [mode, setMode] = useState<"paged" | "search" | "filter">("paged");

  // paged
  const [page, setPage] = useState<Page<MachineDto> | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  // search
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<MachineDto[] | null>(null);

  // filter
  const [minEff, setMinEff] = useState<string>("");
  const [maxEff, setMaxEff] = useState<string>("");
  const [filterResults, setFilterResults] = useState<MachineDto[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const list = useMemo(() => {
    if (mode === "paged") return page?.content ?? [];
    if (mode === "search") return searchResults ?? [];
    return filterResults ?? [];
  }, [mode, page, searchResults, filterResults]);

  async function loadPaged(p = pageIndex) {
    setLoading(true);
    setErr("");
    try {
      const data = await MachinesAPI.paged({ page: p, size: 10, sortBy: "id", direction: "asc" });
      setPage(data);
      setPageIndex(data.number);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPaged(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSearch() {
    setLoading(true);
    setErr("");
    try {
      const data = await MachinesAPI.search(searchName.trim());
      setSearchResults(data);
      setMode("search");
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function doFilter() {
    setLoading(true);
    setErr("");
    try {
      const min = minEff === "" ? undefined : Number(minEff);
      const max = maxEff === "" ? undefined : Number(maxEff);
      const data = await MachinesAPI.filter(min, max);
      setFilterResults(data);
      setMode("filter");
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Machines</h1>
        <Link to="/machines/new">+ Add Machine</Link>
      </div>

      <div style={{ display: "grid", gap: 10, border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => { setMode("paged"); loadPaged(0); }}>Paged</button>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Search by name" />
            <button onClick={doSearch} disabled={!searchName.trim()}>Search</button>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input value={minEff} onChange={(e) => setMinEff(e.target.value)} placeholder="minEfficiency" />
            <input value={maxEff} onChange={(e) => setMaxEff(e.target.value)} placeholder="maxEfficiency" />
            <button onClick={doFilter}>Filter</button>
          </div>
        </div>

        {mode === "paged" && page ? (
          <Paginator page={page.number} totalPages={page.totalPages} onPage={(p) => loadPaged(p)} />
        ) : null}
      </div>

      {loading ? <Loading /> : null}
      {err ? <ErrorBox message={err} /> : null}

      <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={th}>ID</th>
              <th style={th}>Name</th>
              <th style={th}>Daily Prod</th>
              <th style={th}>Error %</th>
              <th style={th}>Maint. Interval</th>
              <th style={th}>Standby</th>
              <th style={th}>Energy</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} style={{ borderTop: "1px solid #eee" }}>
                <td style={td}>{m.id ?? "-"}</td>
                <td style={td}>{m.name}</td>
                <td style={td}>{fmtNumber(m.dailyProduction)}</td>
                <td style={td}>{fmtNumber(m.errorMargin)}</td>
                <td style={td}>{fmtNumber(m.maintenanceInterval)}</td>
                <td style={td}>{fmtNumber(m.standbyTime)}</td>
                <td style={td}>{fmtNumber(m.energyConsumption)}</td>
                <td style={td}>
                  <Link to={`/machines/${m.id}`}>View</Link>
                </td>
              </tr>
            ))}
            {list.length === 0 ? (
              <tr><td style={{ padding: 12 }} colSpan={8}>No records</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: 10, fontSize: 12, color: "#444" };
const td: React.CSSProperties = { padding: 10, fontSize: 13 };
