import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatCard from "../shared/StatCard";

const SleepTab = ({ data, daysInMonth, trackSleepEnabled, onEnableSleep }) => {
  const [chart, setChart] = useState("trend");
  const [enabling, setEnabling] = useState(false);

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-10 flex flex-col items-center justify-center gap-4"
        style={{
          background: "rgba(0,0,0,0.03)",
          border: "1px dashed rgba(0,0,0,0.1)",
        }}
      >
        <span style={{ fontSize: "36px", opacity: 0.3 }}>🌙</span>

        {trackSleepEnabled ? (
          <>
            <p style={{ color: "#5a7a8f", fontSize: "13px", fontWeight: 600 }}>
              Sleep tracking is on
            </p>
            <p
              style={{
                color: "#aaa",
                fontSize: "11px",
                textAlign: "center",
                maxWidth: "200px",
              }}
            >
              Head to Habit Tracker → Sleep Cycle to log your sleep
            </p>
          </>
        ) : (
          <>
            <p style={{ color: "#5a7a8f", fontSize: "13px", fontWeight: 600 }}>
              Sleep tracking is off
            </p>
            <p
              style={{
                color: "#aaa",
                fontSize: "11px",
                textAlign: "center",
                maxWidth: "220px",
              }}
            >
              Enable it to start logging your sleep and see insights here
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={enabling}
              onClick={async () => {
                setEnabling(true);
                await onEnableSleep();
                setEnabling(false);
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white mt-1"
              style={{
                background: enabling
                  ? "rgba(0,0,0,0.1)"
                  : "linear-gradient(135deg, #C89FBB, #a87d9a)",
                boxShadow: enabling
                  ? "none"
                  : "0 8px 24px rgba(200,159,187,0.35)",
                color: enabling ? "#5a7a8f" : "white",
              }}
            >
              {enabling ? "Enabling..." : "🌙 Enable Sleep Tracking"}
            </motion.button>
          </>
        )}
      </motion.div>
    );
  }

  const trackingPct = data.length / daysInMonth;
  const isInconsistent = trackingPct < 0.5;

  const avg = (data.reduce((s, d) => s + d.hours, 0) / data.length).toFixed(1);
  const best = data.reduce((b, d) => (d.hours > b.hours ? d : b), data[0]);
  const worst = data.reduce((w, d) => (d.hours < w.hours ? d : w), data[0]);
  const goalDays = data.filter((d) => d.hours >= 7).length;

  const weeks = [];
  let weekStart = 1;
  let weekNum = 1;
  while (weekStart <= daysInMonth) {
    const weekEnd = Math.min(weekStart + 6, daysInMonth);
    const wd = data.filter((d) => d.day >= weekStart && d.day <= weekEnd);
    weeks.push({
      week: weekNum,
      start: weekStart,
      end: weekEnd,
      avg: wd.length
        ? parseFloat(
            (wd.reduce((s, d) => s + d.hours, 0) / wd.length).toFixed(1),
          )
        : null,
      tracked: wd.length,
    });
    weekStart += 7;
    weekNum++;
  }

  const wc = (a) =>
    a >= 8 ? "#6a9980" : a >= 7 ? "#93B5A0" : a >= 6 ? "#C89FBB" : "#e88080";
  const wl = (a) =>
    a >= 8 ? "great" : a >= 7 ? "good" : a >= 6 ? "okay" : "low";

  const TrendChart = () => {
    const H = 160,
      W = 600;
    const minH = Math.max(
      0,
      Math.floor(Math.min(...data.map((d) => d.hours))) - 1,
    );
    const maxH = Math.ceil(Math.max(...data.map((d) => d.hours))) + 1;
    const toY = (h) => H - ((h - minH) / (maxH - minH)) * (H - 24) - 12;
    const toX = (i) => (i / (data.length - 1)) * W;
    const lp = data
      .map(
        (d, i) =>
          `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d.hours).toFixed(1)}`,
      )
      .join(" ");
    const ap = `${lp} L${toX(data.length - 1).toFixed(1)},${H} L0,${H} Z`;

    return (
      <div>
        <svg
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#93B5A0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#93B5A0" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1={toY(7)}
            x2={W}
            y2={toY(7)}
            stroke="#C89FBB"
            strokeWidth="1.5"
            strokeDasharray="6,4"
            opacity="0.7"
          />
          <path d={ap} fill="url(#sg)" />
          <motion.path
            d={lp}
            fill="none"
            stroke={isInconsistent ? "#C8B97A" : "#93B5A0"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          {data.map((d, i) => (
            <circle
              key={i}
              cx={toX(i)}
              cy={toY(d.hours)}
              r="5"
              fill={d.hours >= 7 ? "#93B5A0" : "#C89FBB"}
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
        </svg>

        <div className="flex justify-between mt-2 px-0.5">
          {data.map((d) => (
            <span
              key={d.day}
              style={{
                fontSize: "8px",
                color:
                  d.day % 5 === 0 || d.day === 1 ? "#5a7a8f" : "transparent",
                fontWeight: 600,
              }}
            >
              {d.day}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div style={{ width: "14px", borderTop: "1.5px dashed #C89FBB" }} />
            <span style={{ fontSize: "10px", color: "#5a7a8f" }}>7h goal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#93B5A0",
              }}
            />
            <span style={{ fontSize: "10px", color: "#5a7a8f" }}>≥7h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#C89FBB",
              }}
            />
            <span style={{ fontSize: "10px", color: "#5a7a8f" }}>&lt;7h</span>
          </div>
        </div>
      </div>
    );
  };

  const DistChart = () => {
    const buckets = [
      { l: "<5h", min: 0, max: 5, c: "#e88080" },
      { l: "5-6h", min: 5, max: 6, c: "#C89FBB" },
      { l: "6-7h", min: 6, max: 7, c: "#a8c5b5" },
      { l: "7-8h", min: 7, max: 8, c: "#93B5A0" },
      { l: "8-9h", min: 8, max: 9, c: "#6a9980" },
      { l: "9h+", min: 9, max: 99, c: "#4a7a60" },
    ];
    const counts = buckets.map((b) => ({
      ...b,
      n: data.filter((d) => d.hours >= b.min && d.hours < b.max).length,
    }));
    const mx = Math.max(...counts.map((c) => c.n), 1);

    return (
      <div className="flex flex-col gap-2">
        {counts.map((b, i) => (
          <div key={b.l} className="flex items-center gap-3">
            <span
              style={{
                width: "32px",
                fontSize: "10px",
                color: "#5a7a8f",
                fontWeight: 600,
              }}
            >
              {b.l}
            </span>
            <div
              className="flex-1 h-7 rounded-lg overflow-hidden"
              style={{ background: "rgba(0,0,0,0.04)" }}
            >
              <motion.div
                className="h-full rounded-lg flex items-center px-2"
                style={{ background: b.c }}
                initial={{ width: 0 }}
                animate={{ width: b.n > 0 ? `${(b.n / mx) * 100}%` : "4px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.07 }}
              >
                {b.n > 0 && (
                  <span
                    style={{ fontSize: "11px", color: "#fff", fontWeight: 700 }}
                  >
                    {b.n}n
                  </span>
                )}
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const HeatChart = () => {
    const gc = (h) =>
      h >= 9
        ? { bg: "#4a7a60", t: "#fff" }
        : h >= 8
          ? { bg: "#93B5A0", t: "#fff" }
          : h >= 7
            ? { bg: "#a8c5b5", t: "#fff" }
            : h >= 6
              ? { bg: "#C89FBB", t: "#fff" }
              : { bg: "rgba(232,128,128,0.5)", t: "#c05050" };

    const dayMap = new Map(data.map((d) => [d.day, d.hours]));

    return (
      <div>
        <div
          className="grid gap-1.5 mb-2"
          style={{ gridTemplateColumns: "repeat(7,1fr)" }}
        >
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div
              key={i}
              className="text-center font-semibold"
              style={{ fontSize: "9px", color: "#5a7a8f" }}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: "repeat(7,1fr)" }}
        >
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const hours = dayMap.get(day);
            const tracked = hours !== undefined;
            const { bg, t } = tracked
              ? gc(hours)
              : { bg: "rgba(0,0,0,0.04)", t: "#ccc" };
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: day * 0.015 }}
                className="aspect-square rounded-lg flex flex-col items-center justify-center"
                style={{ background: bg }}
              >
                <span style={{ fontSize: "9px", fontWeight: 700, color: t }}>
                  {day}
                </span>
                {tracked && (
                  <span style={{ fontSize: "7px", color: t, opacity: 0.9 }}>
                    {hours}h
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {isInconsistent && (
        <div
          className="rounded-xl px-4 py-2 flex items-center gap-2"
          style={{
            background: "rgba(200,185,122,0.15)",
            border: "1px solid rgba(200,185,122,0.3)",
          }}
        >
          <span>⚠️</span>
          <span style={{ fontSize: "12px", color: "#8a7a30" }}>
            Only {data.length} of {daysInMonth} days tracked — data may not
            reflect the full picture
          </span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        <StatCard label="Average" value={`${avg}h`} />
        <StatCard
          label="Best"
          value={`${best.hours}h`}
          sub={`Day ${best.day}`}
        />
        <StatCard
          label="Worst"
          value={`${worst.hours}h`}
          sub={`Day ${worst.day}`}
        />
        <StatCard
          label="Goal hit"
          value={goalDays}
          sub={`of ${data.length}d`}
        />
      </div>

      <div
        className="rounded-2xl p-4"
        style={{
          background: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            style={{
              color: "#5a7a8f",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {chart === "trend"
              ? "Trend"
              : chart === "distribution"
                ? "Distribution"
                : "Heatmap"}
          </span>
          <div
            className="flex gap-1 p-0.5 rounded-xl"
            style={{ background: "rgba(0,0,0,0.05)" }}
          >
            {[
              { id: "trend", i: "📈" },
              { id: "distribution", i: "📊" },
              { id: "heatmap", i: "🗓" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setChart(c.id)}
                className="w-8 h-7 rounded-lg text-sm relative flex items-center justify-center"
              >
                {chart === c.id && (
                  <motion.div
                    layoutId="cb"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    }}
                  />
                )}
                <span className="relative z-10">{c.i}</span>
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {chart === "trend" && (
            <motion.div
              key="t"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TrendChart />
            </motion.div>
          )}
          {chart === "distribution" && (
            <motion.div
              key="d"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DistChart />
            </motion.div>
          )}
          {chart === "heatmap" && (
            <motion.div
              key="h"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HeatChart />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2">
        <span
          style={{
            color: "#5a7a8f",
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Weekly breakdown
        </span>
        {weeks.map((w) => (
          <div
            key={w.week}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.7)",
            }}
          >
            <div style={{ width: "64px", flexShrink: 0 }}>
              <span
                style={{
                  fontSize: "12px",
                  color: "#0d2233",
                  fontWeight: 700,
                  display: "block",
                }}
              >
                Week {w.week}
              </span>
              <span style={{ fontSize: "9px", color: "#aaa" }}>
                {w.start}–{w.end}
              </span>
            </div>
            {w.avg === null ? (
              <>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#aaa",
                    fontStyle: "italic",
                  }}
                >
                  not tracked
                </span>
                <div
                  className="flex-1 h-2 rounded-full"
                  style={{ background: "rgba(0,0,0,0.06)" }}
                />
              </>
            ) : (
              <>
                <span
                  style={{
                    width: "36px",
                    fontSize: "13px",
                    color: "#0d2233",
                    fontWeight: 800,
                  }}
                >
                  {w.avg}h
                </span>
                <div
                  className="flex-1 h-2 rounded-full"
                  style={{ background: "rgba(0,0,0,0.06)" }}
                >
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ background: wc(w.avg) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(w.avg / 10) * 100}%` }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                      delay: w.week * 0.1,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    color: wc(w.avg),
                    fontWeight: 700,
                    width: "32px",
                    textAlign: "right",
                  }}
                >
                  {wl(w.avg)}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SleepTab;
