import React from "react";

export default function Field(props: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, color: "#444" }}>{props.label}</div>
      {props.children}
      {props.hint ? <div style={{ fontSize: 12, color: "#777" }}>{props.hint}</div> : null}
    </label>
  );
}
