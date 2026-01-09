export default function Paginator(props: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const { page, totalPages, onPage } = props;
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button disabled={page <= 0} onClick={() => onPage(page - 1)}>Prev</button>
      <div style={{ fontSize: 12 }}>
        Page <b>{page + 1}</b> / <b>{Math.max(totalPages, 1)}</b>
      </div>
      <button disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)}>Next</button>
    </div>
  );
}
