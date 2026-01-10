export default function ConfirmButton(props: {
  children: string;
  onConfirm: () => void;
  confirmText?: string;
  disabled?: boolean;
}) {
  const { children, onConfirm, confirmText = "Are you sure?", disabled } = props;
  return (
    <button
      disabled={disabled}
      onClick={() => {
        if (window.confirm(confirmText)) onConfirm();
      }}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: disabled ? "#f5f5f5" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
