import React from "react";

const StatCard = ({ label, value, sub, accent }) => (
  <div
    className="flex flex-col gap-0.5 px-4 py-4 rounded-2xl"
    style={{
      background: "rgba(255,255,255,0.7)",
      border: `1px solid ${accent || "rgba(255,255,255,0.8)"}`,
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    }}
  >
    <span
      style={{
        color: "#5a7a8f",
        fontSize: "9px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      {label}
    </span>
    <span className="text-xl font-black" style={{ color: accent || "#0d2233" }}>
      {value}
    </span>
    {sub && <span style={{ color: "#5a7a8f", fontSize: "11px" }}>{sub}</span>}
  </div>
);
export default StatCard;
