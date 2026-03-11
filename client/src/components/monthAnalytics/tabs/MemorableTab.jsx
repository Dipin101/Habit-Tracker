import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DiaryPage from "../shared/DiaryPage";

const MemorableTab = ({ data, monthName, year, daysInMonth }) => {
  const [view, setView] = useState("calendar"),
    [sort, setSort] = useState("recent");
  const [entries, setEntries] = useState(data),
    [diaryEntry, setDiaryEntry] = useState(null);
  const toggleFav = (day) => {
    setEntries((p) =>
      p.map((e) => (e.day === day ? { ...e, favourite: !e.favourite } : e)),
    );
    if (diaryEntry?.day === day)
      setDiaryEntry((p) => ({ ...p, favourite: !p.favourite }));
  };
  const sorted = [...entries].sort((a, b) =>
    sort === "recent"
      ? b.day - a.day
      : sort === "oldest"
        ? a.day - b.day
        : (b.favourite ? 1 : 0) - (a.favourite ? 1 : 0),
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "rgba(0,0,0,0.05)" }}
        >
          {["calendar", "list"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold relative capitalize"
            >
              {view === v && (
                <motion.div
                  layoutId="mv"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "#fff",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
                  }}
                />
              )}
              <span
                className="relative z-10"
                style={{ color: view === v ? "#0d2233" : "#5a7a8f" }}
              >
                {v}
              </span>
            </button>
          ))}
        </div>
        {view === "list" && (
          <div
            className="flex gap-1 p-1 rounded-xl"
            style={{ background: "rgba(0,0,0,0.05)" }}
          >
            {[
              { id: "recent", l: "Recent" },
              { id: "oldest", l: "Oldest" },
              { id: "favourites", l: "⭐ Fav" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold relative"
              >
                {sort === s.id && (
                  <motion.div
                    layoutId="sb"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: "#fff",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
                    }}
                  />
                )}
                <span
                  className="relative z-10"
                  style={{ color: sort === s.id ? "#0d2233" : "#5a7a8f" }}
                >
                  {s.l}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        {view === "calendar" && (
          <motion.div
            key="cal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
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
                  const day = i + 1,
                    entry = entries.find((e) => e.day === day);
                  return (
                    <motion.button
                      key={day}
                      onClick={() => entry && setDiaryEntry(entry)}
                      whileTap={entry ? { scale: 0.88 } : {}}
                      className="rounded-xl flex flex-col items-center justify-center relative gap-0.5"
                      style={{
                        minHeight: "clamp(60px, 10vw, 90px)",
                        background: entry
                          ? "rgba(200,159,187,0.18)"
                          : "rgba(0,0,0,0.03)",
                        border: entry
                          ? "1.5px solid rgba(200,159,187,0.35)"
                          : "1.5px solid transparent",
                        cursor: entry ? "pointer" : "default",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: entry ? 700 : 400,
                          color: entry ? "#a87d9a" : "rgba(0,0,0,0.25)",
                        }}
                      >
                        {day}
                      </span>
                      {entry && (
                        <div className="flex flex-col items-center gap-0.5">
                          <span style={{ fontSize: "10px" }}>📖</span>
                          {entry.favourite && (
                            <span style={{ fontSize: "7px" }}>⭐</span>
                          )}
                          <span
                            className="hidden sm:block"
                            style={{
                              fontSize: "9px",
                              color: "#a87d9a",
                              fontWeight: 600,
                              textAlign: "center",
                              padding: "0 4px",
                              lineHeight: "1.2",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {entry.title}
                          </span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {sorted.map((entry) => (
              <motion.div
                key={entry.day}
                onClick={() => setDiaryEntry(entry)}
                className="rounded-2xl px-5 py-4 cursor-pointer flex items-start gap-4"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(200,159,187,0.15)" }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#a87d9a",
                    }}
                  >
                    {entry.day}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-bold"
                      style={{ color: "#0d2233", fontSize: "13px" }}
                    >
                      {entry.title}
                    </span>
                    {entry.favourite && (
                      <span style={{ fontSize: "12px" }}>⭐</span>
                    )}
                  </div>
                  <p
                    className="mt-0.5 truncate"
                    style={{ color: "#5a7a8f", fontSize: "12px" }}
                  >
                    {entry.journal}
                  </p>
                </div>
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(200,159,187,0.12)" }}
                >
                  <span style={{ fontSize: "14px" }}>📖</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {diaryEntry && (
          <DiaryPage
            entry={diaryEntry}
            monthName={monthName}
            year={year}
            onClose={() => setDiaryEntry(null)}
            onToggleFav={toggleFav}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MemorableTab;
