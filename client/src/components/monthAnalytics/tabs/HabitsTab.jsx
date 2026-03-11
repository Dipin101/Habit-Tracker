import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatCard from "../shared/StatCard";

const CELL = 20;
const LABEL_W = 160;

const HabitsTab = ({ habits, daysInMonth, monthName, year }) => {
  const [modal, setModal] = useState(null);
  const totalCells = habits.length * daysInMonth;
  const totalDone = habits.reduce((s, h) => s + h.completedDays.length, 0);
  const pct = Math.round((totalDone / totalCells) * 100);
  const best = habits.reduce(
    (b, h) => {
      const p = Math.round((h.completedDays.length / daysInMonth) * 100);
      return p > b.pct ? { name: h.name, pct: p } : b;
    },
    { name: "", pct: 0 },
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Overall" value={`${pct}%`} />
        <StatCard
          label="Total done"
          value={totalDone}
          sub={`of ${totalCells}`}
        />
        <StatCard label="Best habit" value={`${best.pct}%`} sub={best.name} />
      </div>

      <div
        className="flex flex-col gap-2 rounded-2xl p-4"
        style={{
          background: "rgba(255,255,255,0.55)",
          border: "1px solid rgba(255,255,255,0.7)",
        }}
      >
        <p className="text-xs md:hidden mb-1" style={{ color: "#5a7a8f" }}>
          ← Scroll to view full chart →
        </p>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ minWidth: `${LABEL_W + daysInMonth * (CELL + 2)}px` }}>
            <div className="flex items-center mb-2">
              <div style={{ width: `${LABEL_W}px`, flexShrink: 0 }} />
              <div className="flex gap-0.5">
                {[...Array(daysInMonth)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${CELL}px`,
                      flexShrink: 0,
                      textAlign: "center",
                      fontSize: "8px",
                      color: "#5a7a8f",
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            {habits.map((habit, hi) => {
              const p = Math.round(
                (habit.completedDays.length / daysInMonth) * 100,
              );
              return (
                <div key={habit.name} className="flex items-center mb-2">
                  <div
                    style={{
                      width: `${LABEL_W}px`,
                      flexShrink: 0,
                      paddingRight: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#0d2233",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {habit.name}
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#5a7a8f",
                        flexShrink: 0,
                      }}
                    >
                      {p}%
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = i + 1,
                        done = habit.completedDays.includes(day),
                        comment = habit.comments?.[day],
                        mn = !done && comment;
                      return (
                        <motion.button
                          key={day}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: hi * 0.04 + i * 0.004 }}
                          onClick={() =>
                            mn &&
                            setModal({ comment, habitName: habit.name, day })
                          }
                          style={{
                            width: `${CELL}px`,
                            height: `${CELL}px`,
                            flexShrink: 0,
                            borderRadius: "3px",
                            background: done
                              ? "#93B5A0"
                              : mn
                                ? "rgba(147,112,154,0.5)"
                                : "rgba(200,159,187,0.18)",
                            cursor: mn ? "pointer" : "default",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        {[
          { color: "#93B5A0", label: "Completed" },
          { color: "rgba(200,159,187,0.25)", label: "Missed" },
          { color: "rgba(147,112,154,0.5)", label: "Missed — tap for note" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: l.color }}
            />
            <span style={{ fontSize: "11px", color: "#5a7a8f" }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {modal && (
          <CommentModal
            {...modal}
            monthName={monthName}
            year={year}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HabitsTab;
