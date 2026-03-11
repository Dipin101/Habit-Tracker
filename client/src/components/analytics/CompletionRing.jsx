import React from "react";

const CompletionRing = ({ completion }) => {
  const r = 10;
  const circ = 2 * Math.PI * r;
  const filled = (completion / 100) * circ;

  return (
    <svg width="40" height="40" viewBox="0 0 28 28" className="mt-2">
      <circle
        cx="14"
        cy="14"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="2.5"
      />
      <circle
        cx="14"
        cy="14"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="2.5"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
      />
      <text
        x="14"
        y="17"
        textAnchor="middle"
        fontSize="6"
        fill="white"
        fontWeight="700"
      >
        {completion}%
      </text>
    </svg>
  );
};

export default CompletionRing;
