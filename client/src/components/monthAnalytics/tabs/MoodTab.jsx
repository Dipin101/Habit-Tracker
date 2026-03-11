import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatCard from "../shared/StatCard";

const MOOD_CONFIG = {
  5: {
    emoji: "😄",
    label: "Great",
    color: "#6a9980",
    bg: "rgba(106,153,128,0.15)",
    text: "#3a6650",
  },
  4: {
    emoji: "🙂",
    label: "Good",
    color: "#93B5A0",
    bg: "rgba(147,181,160,0.15)",
    text: "#4a7a65",
  },
  3: {
    emoji: "😐",
    label: "Okay",
    color: "#C8B97A",
    bg: "rgba(200,185,122,0.15)",
    text: "#8a7a30",
  },
  2: {
    emoji: "😕",
    label: "Bad",
    color: "#C89FBB",
    bg: "rgba(200,159,187,0.18)",
    text: "#8a5a7a",
  },
  1: {
    emoji: "😞",
    label: "Awful",
    color: "#e88080",
    bg: "rgba(232,128,128,0.15)",
    text: "#b04040",
  },
};

const MoodTab = ({
  moodData,
  sleepData,
  habitData,
  memorableData,
  daysInMonth,
  monthName,
  year,
}) => {
  const [view, setView] = useState("calendar");

  // ── empty state ──
  if (!moodData || moodData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-10 flex flex-col items-center justify-center gap-3"
        style={{
          background: "rgba(0,0,0,0.03)",
          border: "1px dashed rgba(0,0,0,0.1)",
        }}
      >
        <span style={{ fontSize: "36px", opacity: 0.3 }}>😶</span>
        <p style={{ color: "#aaa", fontSize: "13px" }}>
          No mood data for this month
        </p>
      </motion.div>
    );
  }

  // ── build a day-keyed map for fast lookup ──
  const moodByDay = new Map(moodData.map((d) => [d.day, d]));
  const sleepByDay = new Map(sleepData.map((d) => [d.day, d]));
  const memorableByDay = new Map(memorableData.map((d) => [d.day, d]));

  // ── stats ──
  const avgMood = (
    moodData.reduce((s, d) => s + d.score, 0) / moodData.length
  ).toFixed(1);
  const best = moodData.reduce(
    (b, d) => (d.score > b.score ? d : b),
    moodData[0],
  );
  const worst = moodData.reduce(
    (w, d) => (d.score < w.score ? d : w),
    moodData[0],
  );
  const moodCounts = [5, 4, 3, 2, 1].map((s) => ({
    score: s,
    ...MOOD_CONFIG[s],
    count: moodData.filter((d) => d.score === s).length,
  }));

  // ── Calendar view ──
  const CalendarView = () => {
    const [selected, setSelected] = useState(null);

    const selMood = selected ? moodByDay.get(selected) : null;
    const selSleep = selected ? sleepByDay.get(selected) : null;
    const selMemorable = selected ? memorableByDay.get(selected) : null;
    const selHabits = selected
      ? habitData.map((h) => ({
          name: h.name,
          done: h.completedDays.includes(selected),
        }))
      : [];

    return (
      <div className="flex flex-col gap-4">
        {/* Calendar grid */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
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
              const mood = moodByDay.get(day);
              const cfg = mood ? MOOD_CONFIG[mood.score] : null;
              const hasMemo = memorableByDay.has(day);
              const isSel = selected === day;
              return (
                <motion.button
                  key={day}
                  whileTap={mood ? { scale: 0.88 } : {}}
                  onClick={() =>
                    mood && setSelected(selected === day ? null : day)
                  }
                  className="rounded-xl flex items-center justify-center relative"
                  style={{
                    aspectRatio: "1",
                    background: cfg ? cfg.bg : "rgba(0,0,0,0.03)",
                    border: isSel
                      ? `2px solid ${cfg?.color}`
                      : "2px solid transparent",
                    cursor: mood ? "pointer" : "default",
                    minHeight: "48px",
                  }}
                >
                  {/* Day number - top left */}
                  <span
                    style={{
                      position: "absolute",
                      top: "4px",
                      left: "6px",
                      fontSize: "8px",
                      fontWeight: 700,
                      color: cfg ? cfg.text : "rgba(0,0,0,0.15)",
                    }}
                  >
                    {day}
                  </span>

                  {cfg ? (
                    <>
                      {/* Emoji - center */}
                      <span style={{ fontSize: "20px", lineHeight: 1 }}>
                        {cfg.emoji}
                      </span>
                      {/* Journal - bottom right */}
                      {hasMemo && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: "3px",
                            right: "5px",
                            fontSize: "10px",
                          }}
                        >
                          📖
                        </span>
                      )}
                    </>
                  ) : (
                    <span
                      style={{
                        fontSize: "7px",
                        fontWeight: "bold",
                        color: "rgba(0,0,0)",
                        textAlign: "center",
                        lineHeight: "1.3",
                        padding: "0 4px",
                      }}
                    >
                      NO RECORD
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <AnimatePresence>
          {selected && selMood && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl p-4 flex flex-col gap-3"
              style={{
                background: "rgba(255,255,255,0.75)",
                border: `1px solid ${MOOD_CONFIG[selMood.score].color}40`,
                boxShadow: `0 4px 20px ${MOOD_CONFIG[selMood.score].color}20`,
              }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "28px" }}>
                  {MOOD_CONFIG[selMood.score].emoji}
                </span>
                <div>
                  <p
                    className="font-black"
                    style={{ color: "#0d2233", fontSize: "15px" }}
                  >
                    {monthName} {selected}
                  </p>
                  <p
                    style={{
                      color: MOOD_CONFIG[selMood.score].color,
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {MOOD_CONFIG[selMood.score].label} day
                  </p>
                </div>
              </div>

              {selSleep && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(147,181,160,0.1)" }}
                >
                  <span style={{ fontSize: "14px" }}>🌙</span>
                  <span style={{ fontSize: "12px", color: "#5a7a8f" }}>
                    Slept
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0d2233",
                    }}
                  >
                    {selSleep.hours}h
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: selSleep.hours >= 7 ? "#6a9980" : "#C89FBB",
                      marginLeft: "auto",
                      fontWeight: 600,
                    }}
                  >
                    {selSleep.hours >= 7 ? "✓ Goal hit" : "Below goal"}
                  </span>
                </div>
              )}

              {selHabits.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#5a7a8f",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Habits
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selHabits.map((h) => (
                      <span
                        key={h.name}
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: h.done
                            ? "rgba(147,181,160,0.2)"
                            : "rgba(200,159,187,0.15)",
                          color: h.done ? "#4a7a65" : "#8a5a7a",
                        }}
                      >
                        {h.done ? "✓" : "✗"} {h.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selMemorable && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(200,159,187,0.1)" }}
                >
                  <span style={{ fontSize: "14px" }}>📖</span>
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#a87d9a",
                        fontWeight: 700,
                      }}
                    >
                      {selMemorable.title}
                    </span>
                    <p
                      className="truncate"
                      style={{
                        fontSize: "11px",
                        color: "#5a7a8f",
                        maxWidth: "220px",
                      }}
                    >
                      {selMemorable.journal}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood breakdown */}
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
            Mood breakdown
          </span>
          {moodCounts.map((m, i) => (
            <div key={m.score} className="flex items-center gap-3">
              <span style={{ fontSize: "14px", width: "20px" }}>{m.emoji}</span>
              <span
                style={{
                  fontSize: "10px",
                  color: "#5a7a8f",
                  width: "32px",
                  fontWeight: 600,
                }}
              >
                {m.label}
              </span>
              <div
                className="flex-1 h-6 rounded-lg overflow-hidden"
                style={{ background: "rgba(0,0,0,0.04)" }}
              >
                <motion.div
                  className="h-full rounded-lg flex items-center px-2"
                  style={{
                    background: m.bg,
                    borderLeft: `3px solid ${m.color}`,
                  }}
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      m.count > 0
                        ? `${(m.count / moodData.length) * 100}%`
                        : "0%",
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                    delay: i * 0.07,
                  }}
                >
                  {m.count > 0 && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: m.text,
                        fontWeight: 700,
                      }}
                    >
                      {m.count}d
                    </span>
                  )}
                </motion.div>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  color: "#5a7a8f",
                  width: "20px",
                  textAlign: "right",
                }}
              >
                {m.count}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <span style={{ fontSize: "10px", color: "#5a7a8f" }}>
              📖 = memorable day
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ── Correlation view ──
  const CorrelationView = () => {
    const avgMoodForDays = (days) => {
      const scores = days
        .map((day) => moodByDay.get(day)?.score)
        .filter(Boolean);
      if (!scores.length) return null;
      return (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1);
    };

    const goodSleepDays = sleepData
      .filter((d) => d.hours >= 7)
      .map((d) => d.day);
    const badSleepDays = sleepData.filter((d) => d.hours < 6).map((d) => d.day);
    const allDays = [...Array(daysInMonth)].map((_, i) => i + 1);
    const allHabitsDays = allDays.filter((day) =>
      habitData.every((h) => h.completedDays.includes(day)),
    );
    const noHabitsDays = allDays.filter(
      (day) => !habitData.some((h) => h.completedDays.includes(day)),
    );
    const memorableDays = memorableData.map((d) => d.day);
    const noMemorableDays = allDays.filter((day) => !memorableByDay.has(day));
    const perfectDays = goodSleepDays.filter((d) => allHabitsDays.includes(d));

    const rows = [
      {
        label: "🌙 Slept well (≥7h)",
        days: goodSleepDays,
        desc: `${goodSleepDays.length} days`,
      },
      {
        label: "😴 Slept badly (<6h)",
        days: badSleepDays,
        desc: `${badSleepDays.length} days`,
      },
      {
        label: "✅ All habits done",
        days: allHabitsDays,
        desc: `${allHabitsDays.length} days`,
      },
      {
        label: "❌ No habits done",
        days: noHabitsDays,
        desc: `${noHabitsDays.length} days`,
      },
      {
        label: "📖 Wrote memorable",
        days: memorableDays,
        desc: `${memorableDays.length} days`,
      },
      {
        label: "🔇 No memorable",
        days: noMemorableDays,
        desc: `${noMemorableDays.length} days`,
      },
      {
        label: "⭐ Perfect day",
        days: perfectDays,
        desc: `${perfectDays.length} days`,
      },
    ]
      .map((r) => ({ ...r, avg: avgMoodForDays(r.days) }))
      .filter((r) => r.avg !== null);

    return (
      <div className="flex flex-col gap-4">
        <p style={{ fontSize: "12px", color: "#5a7a8f", lineHeight: "1.6" }}>
          Average mood score on days where each condition was true. See what
          actually moves your mood.
        </p>
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => {
            const score = parseFloat(row.avg);
            const cfg = MOOD_CONFIG[Math.round(score)];
            return (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                className="flex flex-col gap-1.5 px-4 py-3 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.65)",
                  border: "1px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "13px" }}>{row.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: "18px" }}>{cfg.emoji}</span>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 900,
                        color: cfg.color,
                      }}
                    >
                      {row.avg}
                    </span>
                    <span style={{ fontSize: "10px", color: "#5a7a8f" }}>
                      /5
                    </span>
                  </div>
                </div>
                <div
                  className="h-1.5 rounded-full w-full"
                  style={{ background: "rgba(0,0,0,0.06)" }}
                >
                  <motion.div
                    className="h-1.5 rounded-full"
                    style={{ background: cfg.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / 5) * 100}%` }}
                    transition={{
                      duration: 0.7,
                      ease: "easeOut",
                      delay: i * 0.07 + 0.1,
                    }}
                  />
                </div>
                <span style={{ fontSize: "10px", color: "#5a7a8f" }}>
                  {row.desc}
                </span>
              </motion.div>
            );
          })}
        </div>

        {rows.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl px-4 py-3"
            style={{
              background: "rgba(106,153,128,0.1)",
              border: "1px solid rgba(106,153,128,0.2)",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "#4a7a65",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              💡 Insight
            </span>
            <p
              style={{
                fontSize: "12px",
                color: "#0d2233",
                marginTop: "4px",
                lineHeight: "1.6",
              }}
            >
              {(() => {
                const sorted = [...rows].sort(
                  (a, b) => parseFloat(b.avg) - parseFloat(a.avg),
                );
                const top = sorted[0],
                  bottom = sorted[sorted.length - 1];
                return `Your mood is highest on ${top.label.split(" ").slice(1).join(" ")} days (${top.avg}/5) and lowest on ${bottom.label.split(" ").slice(1).join(" ")} days (${bottom.avg}/5).`;
              })()}
            </p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Avg mood"
          value={`${avgMood}/5`}
          accent={MOOD_CONFIG[Math.round(parseFloat(avgMood))].color}
        />
        <StatCard
          label="Best day"
          value={MOOD_CONFIG[best.score].emoji}
          sub={`${monthName} ${best.day}`}
        />
        <StatCard
          label="Worst day"
          value={MOOD_CONFIG[worst.score].emoji}
          sub={`${monthName} ${worst.day}`}
        />
      </div>

      <div
        className="flex gap-1 p-1 rounded-xl self-start"
        style={{ background: "rgba(0,0,0,0.05)" }}
      >
        {[
          { id: "calendar", label: "📅 Calendar" },
          { id: "correlation", label: "🔗 Correlation" },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold relative"
          >
            {view === v.id && (
              <motion.div
                layoutId="moodView"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: "#fff",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
                }}
              />
            )}
            <span
              className="relative z-10"
              style={{ color: view === v.id ? "#0d2233" : "#5a7a8f" }}
            >
              {v.label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === "calendar" && (
          <motion.div
            key="cal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CalendarView />
          </motion.div>
        )}
        {view === "correlation" && (
          <motion.div
            key="cor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CorrelationView />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MoodTab;
