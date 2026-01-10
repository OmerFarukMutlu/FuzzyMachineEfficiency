export default function Loading({ label = "Loading..." }: { label?: string }) {
  return <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>{label}</div>;
}
