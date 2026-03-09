import React, { useRef, useState, useEffect } from "react";
import { FaCheck, FaComment, FaHourglassHalf, FaTimes } from "react-icons/fa";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { auth } from "../firebase";
import { DateTime } from "luxon";
import { fetchFromBackend } from "../api";
import { motion, AnimatePresence } from "framer-motion";

const MAX_HABITS = 10;

const STATUS = {
  COMPLETED: "completed",
  NOT_DONE: "not completed",
  IN_PROGRESS: "in progress",
};

const HabitsToTrack = () => {
  const [savedHabits, setSavedHabits] = useState([]);
  const [habitStatuses, setHabitStatuses] = useState({});
  const [habitComments, setHabitComments] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalInputs, setModalInputs] = useState([]);
  const [modalError, setModalError] = useState({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentCommentIndex, setCurrentCommentIndex] = useState(null);
  const [currentCommentText, setCurrentCommentText] = useState("");

  const inputRefs = useRef([]);
  const commentRefs = useRef(null);

  const nowToronto = DateTime.now().setZone("America/Toronto");
  const today = nowToronto.toFormat("yyyy-MM-dd");
  const currentMonth = String(nowToronto.month).padStart(2, "0");
  const displayMonth = nowToronto.toFormat("LLLL yyyy");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchHabits(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showModal && modalInputs.length > 0) {
      inputRefs.current[modalInputs.length - 1]?.focus();
    }
  }, [showModal, modalInputs.length]);

  useEffect(() => {
    if (showCommentModal) commentRefs.current?.focus();
  }, [showCommentModal]);

  const openModal = () => {
    if (savedHabits.length >= MAX_HABITS) return;
    setModalInputs([""]);
    setShowModal(true);
  };

  const addHabitInput = () => {
    if (modalInputs.length + savedHabits.length < MAX_HABITS)
      setModalInputs([...modalInputs, ""]);
  };

  const updateModalInput = (index, value) => {
    const updated = [...modalInputs];
    updated[index] = value;
    setModalInputs(updated);
    validateModalInputs(updated);
  };

  const validateModalInputs = (inputs) => {
    const errors = {};
    inputs.forEach((habit, index) => {
      const trimmed = habit.trim();
      if (!trimmed) return;
      if (savedHabits.includes(trimmed)) {
        errors[index] = "Already exists.";
        return;
      }
      const dup = inputs.findIndex(
        (h, i) => h.trim() === trimmed && i !== index,
      );
      if (dup !== -1) errors[index] = "Duplicate habit.";
    });
    setModalError(errors);
  };

  const removeModalInput = (index) => {
    const updated = modalInputs.filter((_, i) => i !== index);
    setModalInputs(updated);
    validateModalInputs(updated);
  };

  const handleSave = () => {
    const cleaned = modalInputs
      .map((h) => h.trim())
      .filter(
        (h, i, arr) =>
          h !== "" && !savedHabits.includes(h) && arr.indexOf(h) === i,
      );
    if (cleaned.length === 0) return;

    const newSaved = [...savedHabits, ...cleaned];
    const statuses = { ...habitStatuses };
    const comments = { ...habitComments };

    cleaned.forEach((_, i) => {
      const idx = savedHabits.length + i;
      statuses[idx] = { [today]: STATUS.IN_PROGRESS };
      comments[idx] = { [today]: { text: "", date: today } };
    });

    setSavedHabits(newSaved);
    setHabitStatuses(statuses);
    setHabitComments(comments);
    setShowModal(false);
    handleSubmitHabits(newSaved, statuses, comments);
  };

  const toggleStatus = (index, status) => {
    setHabitStatuses((prev) => {
      const updated = { ...prev, [index]: { ...prev[index], [today]: status } };
      handleSubmitHabits(savedHabits, updated, habitComments);
      return updated;
    });
  };

  const openCommentModal = (index) => {
    setCurrentCommentIndex(index);
    setCurrentCommentText(habitComments[index]?.[today]?.text || "");
    setShowCommentModal(true);
  };

  const saveComment = () => {
    if (currentCommentIndex !== null) {
      setHabitComments((prev) => {
        const updated = {
          ...prev,
          [currentCommentIndex]: {
            ...prev[currentCommentIndex],
            [today]: { text: currentCommentText, date: today },
          },
        };
        handleSubmitHabits(savedHabits, habitStatuses, updated);
        return updated;
      });
    }
    setShowCommentModal(false);
    setCurrentCommentIndex(null);
    setCurrentCommentText("");
    commentRefs.current = null;
  };

  const handleSubmitHabits = async (saved, statuses, comments) => {
    const user = auth.currentUser;
    if (!user) return;
    const habitsPayload = saved.map((habit, index) => ({
      title: habit,
      status: Object.entries(statuses[index] || {}).map(([date, status]) => ({
        date,
        status,
      })),
      comment: Object.entries(comments[index] || {}).map(([date, c]) => ({
        date,
        text: c.text || "",
      })),
    }));
    try {
      await fetchFromBackend("/api/users/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          month: currentMonth,
          year: nowToronto.year,
          habits: habitsPayload,
        }),
      });
    } catch (err) {
      console.error("Server error:", err);
    }
  };

  const fetchHabits = async (user) => {
    try {
      const res = await fetchFromBackend(
        `/api/users/habits/${user.uid}?month=${currentMonth}&year=${nowToronto.year}`,
      );
      if (res && Array.isArray(res.habits) && res.habits.length > 0) {
        const loadedStatuses = {};
        const loadedComments = {};
        res.habits.forEach((habit, index) => {
          loadedStatuses[index] = {};
          loadedComments[index] = {};
          habit.status.forEach((s) => {
            loadedStatuses[index][s.date] = s.status;
          });
          habit.comment.forEach((c) => {
            loadedComments[index][c.date] = { text: c.text, date: c.date };
          });
          if (!loadedStatuses[index][today])
            loadedStatuses[index][today] = STATUS.IN_PROGRESS;
        });
        setSavedHabits(res.habits.map((h) => h.title));
        setHabitStatuses(loadedStatuses);
        setHabitComments(loadedComments);
      }
    } catch (err) {
      console.error("Error fetching habits:", err);
    }
  };

  const remainingHabits = MAX_HABITS - savedHabits.length;

  const statusConfig = {
    [STATUS.COMPLETED]: {
      icon: <FaCheck size={12} />,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.15)",
      border: "rgba(34,197,94,0.5)",
    },
    [STATUS.NOT_DONE]: {
      icon: <FaTimes size={12} />,
      color: "#dc2626",
      bg: "rgba(220,38,38,0.1)",
      border: "rgba(220,38,38,0.3)",
    },
    [STATUS.IN_PROGRESS]: {
      icon: <FaHourglassHalf size={12} />,
      color: "#C89FBB",
      bg: "rgba(200,159,187,0.15)",
      border: "rgba(200,159,187,0.4)",
    },
  };

  const modalStyle = {
    background: "#ebf5fa",
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-widest font-medium text-accent-green">
            {displayMonth}
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-text">
            {savedHabits.length === MAX_HABITS
              ? "Your Habits"
              : "Habits to Track"}
          </h2>
          <p className="text-sm text-sub-text">
            {savedHabits.length === MAX_HABITS
              ? `Fixed habits for ${displayMonth}.`
              : remainingHabits > 0
                ? `You can add ${remainingHabits} more habit${remainingHabits > 1 ? "s" : ""} this month.`
                : "Track your daily habits here."}
          </p>
        </div>
        {remainingHabits > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white self-start sm:self-auto"
            style={{
              background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
              boxShadow: "0 8px 24px rgba(200,159,187,0.35)",
            }}
          >
            <AiOutlinePlus size={16} />
            Add Habits
          </motion.button>
        )}
      </div>

      {/* Habits list */}
      {savedHabits.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.06)" }}
        >
          {/* Table header — hidden on mobile */}
          <div
            className="hidden sm:grid grid-cols-[1fr_auto] gap-4 px-4 py-2 text-xs uppercase tracking-widest font-medium text-sub-text"
            style={{
              background: "rgba(0,0,0,0.02)",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <span>Habit</span>
            <div className="flex items-center gap-2 pr-1">
              <span className="w-8 text-center">✓</span>
              <span className="w-8 text-center">✕</span>
              <span className="w-8 text-center">⏳</span>
              <span className="w-8 text-center">💬</span>
            </div>
          </div>

          <ul
            className="flex flex-col divide-y"
            style={{ background: "rgba(255,255,255,0.4)" }}
          >
            {savedHabits.map((habit, index) => {
              const currentStatus = habitStatuses[index]?.[today];
              const hasComment = !!habitComments[index]?.[today]?.text;

              return (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Status dot */}
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background: currentStatus
                          ? statusConfig[currentStatus]?.color
                          : "#C89FBB",
                      }}
                    />
                    <span className="text-sm font-medium text-text capitalize">
                      {habit}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 ml-5 sm:ml-0">
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <motion.button
                        key={status}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleStatus(index, status)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background:
                            currentStatus === status
                              ? config.bg
                              : "rgba(0,0,0,0.04)",
                          border: `1px solid ${currentStatus === status ? config.border : "rgba(0,0,0,0.08)"}`,
                          color:
                            currentStatus === status ? config.color : "#5a7a8f",
                        }}
                      >
                        {config.icon}
                      </motion.button>
                    ))}

                    {/* Comment button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openCommentModal(index)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: hasComment
                          ? "rgba(200,159,187,0.15)"
                          : "rgba(0,0,0,0.04)",
                        border: `1px solid ${hasComment ? "rgba(200,159,187,0.4)" : "rgba(0,0,0,0.08)"}`,
                        color: hasComment ? "#C89FBB" : "#5a7a8f",
                      }}
                    >
                      <FaComment size={12} />
                    </motion.button>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {savedHabits.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(200,159,187,0.1)" }}
          >
            <FaCheck style={{ color: "#C89FBB" }} />
          </div>
          <p className="text-sm font-medium text-text">No habits yet</p>
          <p className="text-xs text-sub-text">
            Click Add Habits to get started.
          </p>
        </div>
      )}

      {/* Add Habits Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
              style={modalStyle}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <p
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: "#a87d9a" }}
                  >
                    New Habits
                  </p>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "#0d2233" }}
                  >
                    Add Your Habits
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.06)", color: "#5a7a8f" }}
                >
                  <AiOutlineClose size={14} />
                </button>
              </div>

              <p
                className="text-xs px-3 py-2 rounded-xl"
                style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}
              >
                Once added, habits cannot be edited for the month.
              </p>

              <div
                className="h-px"
                style={{ background: "rgba(0,0,0,0.06)" }}
              />

              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {modalInputs.map((habit, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <div className="flex gap-2 items-center">
                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        value={habit}
                        onChange={(e) =>
                          updateModalInput(index, e.target.value)
                        }
                        placeholder={`Habit ${savedHabits.length + index + 1}`}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                        style={{
                          background: "rgba(0,0,0,0.05)",
                          border: `1px solid ${modalError[index] ? "#dc2626" : "rgba(0,0,0,0.08)"}`,
                          color: "#0d2233",
                        }}
                      />
                      <button
                        onClick={() => removeModalInput(index)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(220,38,38,0.08)",
                          color: "#dc2626",
                        }}
                      >
                        <AiOutlineClose size={14} />
                      </button>
                    </div>
                    {modalError[index] && (
                      <p className="text-xs pl-1" style={{ color: "#dc2626" }}>
                        {modalError[index]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {savedHabits.length + modalInputs.length < MAX_HABITS && (
                <button
                  onClick={addHabitInput}
                  disabled={Object.keys(modalError).length > 0}
                  className="flex items-center gap-2 text-sm font-medium transition-opacity"
                  style={{
                    color:
                      Object.keys(modalError).length > 0
                        ? "#5a7a8f"
                        : "#a87d9a",
                    opacity: Object.keys(modalError).length > 0 ? 0.5 : 1,
                  }}
                >
                  <AiOutlinePlus size={16} /> Add Another
                </button>
              )}

              <div className="flex gap-3 mt-1">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "rgba(0,0,0,0.05)", color: "#5a7a8f" }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={Object.keys(modalError).length > 0}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background:
                      Object.keys(modalError).length > 0
                        ? "rgba(0,0,0,0.1)"
                        : "linear-gradient(135deg, #C89FBB, #a87d9a)",
                    color:
                      Object.keys(modalError).length > 0 ? "#5a7a8f" : "white",
                  }}
                >
                  Save Habits
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Modal */}
      <AnimatePresence>
        {showCommentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowCommentModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
              style={modalStyle}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <p
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: "#a87d9a" }}
                  >
                    {nowToronto.toFormat("d LLLL yyyy")}
                  </p>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "#0d2233" }}
                  >
                    Add Comment
                  </h2>
                </div>
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.06)", color: "#5a7a8f" }}
                >
                  <AiOutlineClose size={14} />
                </button>
              </div>

              <div
                className="h-px"
                style={{ background: "rgba(0,0,0,0.06)" }}
              />

              <textarea
                ref={commentRefs}
                rows={4}
                value={currentCommentText}
                onChange={(e) => setCurrentCommentText(e.target.value)}
                placeholder="Write your comment..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  color: "#0d2233",
                }}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    commentRefs.current = null;
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "rgba(0,0,0,0.05)", color: "#5a7a8f" }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveComment}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
                    boxShadow: "0 8px 24px rgba(200,159,187,0.35)",
                  }}
                >
                  Save Comment
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HabitsToTrack;
