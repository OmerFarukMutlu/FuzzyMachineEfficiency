export function fmtNumber(n: number, digits = 2) {
  if (Number.isNaN(n) || n === null || n === undefined) return "-";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(n);
}

export function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
