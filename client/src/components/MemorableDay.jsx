import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { DateTime } from "luxon";
import { fetchFromBackend } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "./Loading";

const MemorableDay = ({ onAdd }) => {
  const MAX_SUMMARY_LENGTH = 100;

  const [summary, setSummary] = useState("");
  const [journal, setJournal] = useState("");
  const [showJournal, setShowJournal] = useState(false);
  const [summaryAdded, setSummaryAdded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const nowToronto = DateTime.now().setZone("America/Toronto");
  const day = String(nowToronto.day).padStart(2, "0");
  const month = String(nowToronto.month).padStart(2, "0");
  const year = nowToronto.year;

  useEffect(() => {
    const fetchTodaySummary = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchFromBackend(
          `/api/users/memorable/${user.uid}/${year}/${month}/${day}`,
        );
        if (data && data.summary) {
          setSummary(data.summary);
          setJournal(data.journal || "");
          setSummaryAdded(true);
          setShowJournal(false);
        }
      } catch (err) {
        console.error("Error fetching today's summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaySummary();
  }, [day, month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summary) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      const data = await fetchFromBackend("/api/users/memorable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          day,
          month,
          year,
          summary,
          journal,
        }),
      });
      setSuccessMessage(data.message || "Summary added successfully!");
      setErrorMessage("");
      setSummaryAdded(true);
      setShowJournal(false);
      onAdd && onAdd({ day, month, year, summary, journal });
    } catch (err) {
      console.error("Error adding memorable day:", err);
      setErrorMessage("Server error. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <Loading />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest font-medium text-accent-green">
          {nowToronto.toFormat("d LLLL yyyy")}
        </p>
        <h2 className="text-xl md:text-2xl font-bold text-text">
          Memorable Day
        </h2>
        <p className="text-sm text-sub-text">
          Write highlights or memorable moments of your day.
        </p>
      </div>

      {/* Status badge */}
      {summaryAdded && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl w-fit text-xs font-medium"
          style={{
            background: "rgba(147,181,160,0.15)",
            border: "1px solid rgba(147,181,160,0.3)",
            color: "#5a7a8f",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
          Summary saved for today
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Summary */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-widest font-medium text-sub-text">
              Summary
            </label>
            <span className="text-xs text-sub-text">
              {MAX_SUMMARY_LENGTH - summary.length} left
            </span>
          </div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={MAX_SUMMARY_LENGTH}
            readOnly={summaryAdded}
            placeholder={
              summaryAdded
                ? "Summary already added for today"
                : "Write a short summary of the day..."
            }
            rows={2}
            className="w-full px-4 py-3 rounded-xl text-sm text-text outline-none resize-none transition-all"
            style={{
              background: summaryAdded
                ? "rgba(0,0,0,0.03)"
                : "rgba(255,255,255,0.6)",
              border: "1px solid rgba(0,0,0,0.08)",
              cursor: summaryAdded ? "default" : "text",
            }}
          />
        </div>

        {/* Messages */}
        <AnimatePresence>
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-error"
            >
              {errorMessage}
            </motion.p>
          )}
          {successMessage && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-accent-green"
            >
              {successMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Journal toggle */}
        {!summaryAdded && (
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer"
            style={{
              background: showJournal
                ? "rgba(200,159,187,0.1)"
                : "rgba(0,0,0,0.03)",
              border: showJournal
                ? "1px solid rgba(200,159,187,0.25)"
                : "1px solid rgba(0,0,0,0.06)",
            }}
            onClick={() => !summaryAdded && setShowJournal((prev) => !prev)}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-text">Add Journal</span>
              <span className="text-xs text-sub-text">
                Optional detailed notes for the day
              </span>
            </div>
            <motion.div
              animate={{ x: showJournal ? 16 : 2 }}
              transition={{ duration: 0.2 }}
              className="w-10 h-6 rounded-full relative flex-shrink-0"
              style={{
                background: showJournal
                  ? "linear-gradient(135deg, #C89FBB, #a87d9a)"
                  : "rgba(0,0,0,0.15)",
              }}
            >
              <motion.div
                animate={{ x: showJournal ? 16 : 2 }}
                transition={{ duration: 0.2 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
              />
            </motion.div>
          </div>
        )}

        {/* Journal textarea */}
        <AnimatePresence>
          {showJournal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                placeholder="Detailed journal / comment (optional)"
                disabled={summaryAdded}
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm text-text outline-none resize-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  maxHeight: "320px",
                  overflowY: "auto",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        {!summaryAdded && (
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full md:w-auto md:self-start px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
              boxShadow: "0 8px 24px rgba(200,159,187,0.35)",
            }}
          >
            Save Day
          </motion.button>
        )}
      </form>
    </motion.div>
  );
};

export default MemorableDay;
