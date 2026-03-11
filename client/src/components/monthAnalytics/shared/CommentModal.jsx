import React from "react";
import { motion } from "framer-motion";

const CommentModal = ({
  comment,
  habitName,
  day,
  monthName,
  year,
  onClose,
}) => (
  <motion.div
    className="fixed inset-0 z-[300] flex items-center justify-center px-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <div
      className="absolute inset-0"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    />
    <motion.div
      className="relative rounded-2xl px-6 py-5 max-w-sm w-full"
      style={{ background: "#fff", boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}
      initial={{ scale: 0.9, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 10 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span
            style={{
              color: "#C89FBB",
              fontSize: "9px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {monthName} {day}, {year}
          </span>
          <p
            className="font-bold mt-0.5"
            style={{ color: "#0d2233", fontSize: "14px" }}
          >
            {habitName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.06)",
            color: "#5a7a8f",
            fontSize: "16px",
          }}
        >
          ×
        </button>
      </div>
      <div
        className="rounded-xl px-4 py-3"
        style={{
          background: "rgba(147,112,154,0.08)",
          border: "1px solid rgba(147,112,154,0.2)",
        }}
      >
        <span
          style={{
            fontSize: "9px",
            color: "#7a5c8a",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          💬 Why I missed it
        </span>
        <p
          className="mt-1.5 leading-relaxed"
          style={{ color: "#0d2233", fontSize: "13px" }}
        >
          {comment}
        </p>
      </div>
    </motion.div>
  </motion.div>
);

export default CommentModal;
