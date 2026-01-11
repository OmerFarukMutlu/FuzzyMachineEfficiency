import { NavLink, Outlet } from "react-router-dom";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: isActive ? "white" : "#111",
  background: isActive ? "#111" : "transparent",
  border: "1px solid #ddd",
});

export default function AppLayout() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
      <aside style={{ padding: 16, borderRight: "1px solid #eee" }}>
        <h2 style={{ margin: "6px 0 14px" }}>Fuzzy4MFG</h2>
        <nav style={{ display: "grid", gap: 10 }}>
          <NavLink to="/machines" style={linkStyle}>Machines</NavLink>
          <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
          <NavLink to="/simulate" style={linkStyle}>Simulation</NavLink>
          <NavLink to="/compare" style={linkStyle}>Comparison</NavLink>
          <NavLink to="/recommend" style={linkStyle}>Recommendations</NavLink>
          <NavLink to="/import-export" style={linkStyle}>Import / Export</NavLink>
        </nav>
        <div style={{ marginTop: 14, fontSize: 12, color: "#666" }}>
          API: {import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"}
        </div>
      </aside>

      <main style={{ padding: 18 }}>
        <Outlet />
      </main>
    </div>
  );
}
