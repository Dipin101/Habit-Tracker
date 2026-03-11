import React from "react";
import { motion } from "framer-motion";

const DiaryPage = ({ entry, monthName, year, onClose, onToggleFav }) => (
  <motion.div
    className="fixed inset-0 z-[200] flex items-center justify-center px-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div
      className="absolute inset-0"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    />
    <motion.div
      className="relative w-full max-w-md rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg,#faf5ee,#f0e8da)",
        boxShadow: "0 32px 64px rgba(0,0,0,0.2)",
        maxHeight: "80vh",
      }}
      initial={{ scale: 0.92, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.92, y: 20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className="px-6 pt-6 pb-4"
        style={{ borderBottom: "1px solid rgba(160,135,110,0.15)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <span
              style={{
                color: "rgba(160,130,100,0.6)",
                fontSize: "9px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {monthName} {entry.day}, {year}
            </span>
            <h2
              className="font-black mt-1"
              style={{ color: "#2d1f0e", fontSize: "18px" }}
            >
              {entry.title}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleFav(entry.day)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: entry.favourite
                  ? "rgba(255,200,0,0.15)"
                  : "rgba(0,0,0,0.05)",
              }}
            >
              <span style={{ fontSize: "16px" }}>
                {entry.favourite ? "⭐" : "☆"}
              </span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(0,0,0,0.06)",
                color: "rgba(100,80,60,0.6)",
                fontSize: "16px",
              }}
            >
              ×
            </button>
          </div>
        </div>
      </div>
      <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: "55vh" }}>
        <div className="relative">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full"
              style={{
                top: `${i * 38 + 16}px`,
                height: "1px",
                background: "rgba(160,135,110,0.1)",
              }}
            />
          ))}
          <p
            className="relative"
            style={{
              color: "#3d2a1a",
              fontSize: "16px",
              lineHeight: "32px",
              fontWeight: 400,
              letterSpacing: "0.01em",
            }}
          >
            {entry.journal}
          </p>
        </div>
      </div>
      <div
        className="px-6 py-3 flex justify-end"
        style={{ borderTop: "1px solid rgba(160,135,110,0.1)" }}
      >
        <span
          style={{
            color: "rgba(160,130,100,0.4)",
            fontSize: "9px",
            fontWeight: 500,
          }}
        >
          day {entry.day}
        </span>
      </div>
    </motion.div>
  </motion.div>
);

export default DiaryPage;
