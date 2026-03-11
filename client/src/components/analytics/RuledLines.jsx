import React from "react";

const RuledLines = ({ color }) => (
  <div className="flex flex-col gap-1.5 w-full px-3 mt-3">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="rounded-full"
        style={{
          height: "1px",
          background: color,
          opacity: 0.2 + i * 0.05,
          width: `${95 - i * 6}%`,
        }}
      />
    ))}
  </div>
);

export default RuledLines;
