export default function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{ padding: 12, border: "1px solid #f2b8b5", background: "#fff1f0", borderRadius: 12 }}>
      <b>Error</b>
      <div style={{ marginTop: 6 }}>{message}</div>
    </div>
  );
}
