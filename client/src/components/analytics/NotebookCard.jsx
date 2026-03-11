import React from "react";

import { motion } from "framer-motion";
import RuledLines from "./RuledLines";
import CompletionRing from "./CompletionRing";

const NotebookCard = ({
  month,
  year,
  status,
  completion,
  index,
  onSelect,
  zooming,
}) => {
  const isFuture = status === "future";
  const isEmpty = status === "empty";
  const isClickable = !isFuture && !isEmpty;
  const intensity =
    status === "data" || status === "current"
      ? 0.35 + (completion / 100) * 0.65
      : 1;
  const isActive = zooming?.month === month;

  const getCover = () => {
    if (status === "current")
      return `linear-gradient(160deg,
        rgba(${Math.round(80 + intensity * 67)},${Math.round(140 + intensity * 41)},${Math.round(120 + intensity * 40)},1) 0%,
        rgba(${Math.round(50 + intensity * 40)},${Math.round(100 + intensity * 38)},${Math.round(80 + intensity * 30)},1) 100%)`;
    if (status === "data")
      return `linear-gradient(160deg,rgba(200,159,187,${intensity}) 0%,rgba(168,125,154,${intensity}) 100%)`;
    if (status === "empty")
      return "linear-gradient(160deg,#dce8ed 0%,#c8d8df 100%)";
    return "linear-gradient(160deg,#eef3f5 0%,#e2ecf0 100%)";
  };

  return (
    <motion.div
      layout
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: zooming && !isActive ? 0 : 1,
        scale: isActive ? 3 : 1,
        zIndex: isActive ? 50 : 1,
      }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: "easeInOut" }}
    >
      <motion.div
        onClick={() => isClickable && onSelect(month, year)}
        whileHover={isClickable ? { y: -6, scale: 1.04 } : {}}
        whileTap={isClickable ? { scale: 0.97 } : {}}
        className="relative w-full rounded-xl overflow-hidden select-none"
        style={{
          background: getCover(),
          minHeight: "180px",
          cursor: isClickable ? "pointer" : "default",
        }}
      >
        <div className="pl-6 pr-3 pt-4 pb-4 flex flex-col">
          <span className="text-sm font-bold uppercase tracking-widest text-white">
            {month}
          </span>
          <span className="text-xs opacity-70 text-white">{year}</span>
          <RuledLines color="rgba(255,255,255,0.8)" />
          {(status === "data" || status === "current") && (
            <CompletionRing completion={completion} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotebookCard;
