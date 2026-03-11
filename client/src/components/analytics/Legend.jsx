import React from "react";

const Legend = () => (
  <div className="flex items-center gap-5 flex-wrap">
    {[
      { color: "linear-gradient(135deg,#93B5A0,#6a9980)", label: "Current" },
      { color: "linear-gradient(135deg,#C89FBB,#a87d9a)", label: "Tracked" },
      { color: "linear-gradient(135deg,#dce8ed,#c8d8df)", label: "Empty" },
      { color: "linear-gradient(135deg,#eef3f5,#e2ecf0)", label: "Future" },
    ].map(({ color, label }) => (
      <div key={label} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
        <span className="text-xs text-sub-text">{label}</span>
      </div>
    ))}
  </div>
);

export default Legend;
