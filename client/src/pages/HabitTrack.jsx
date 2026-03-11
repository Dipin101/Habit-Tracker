import React, { useState, useEffect } from "react";
import { IoAddOutline } from "react-icons/io5";
import { AiOutlineClose } from "react-icons/ai";
import Tab from "../components/Tab";
import MemorableDay from "../components/MemorableDay";
import SleepCycle from "../components/SleepCycle";
import HabitsToTrack from "../components/HabitsToTrack";
import Loading from "../components/Loading";
import { auth } from "../firebase";
import { DateTime } from "luxon";
import { onAuthStateChanged } from "firebase/auth";
import { fetchFromBackend } from "../api";
import { motion, AnimatePresence } from "framer-motion";

const HabitTrack = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "memorable";
  });
  const [currentMonthData, setCurrentMonthData] = useState(null);
  const [trackSleepModal, setTrackSleepModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const nowToronto = DateTime.now().setZone("America/Toronto");
  const currentYear = nowToronto.year;
  const currentMonth = String(nowToronto.month).padStart(2, "0");

  const sleepTrackingStart = trackSleepModal
    ? DateTime.now().setZone("America/Toronto").toJSDate()
    : null;

  useEffect(() => {
    if (!currentMonthData?.trackSleep && activeTab === "sleep" && !loading) {
      setActiveTab("memorable");
    }
  }, [currentMonthData, activeTab, loading]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setUser(currentUser);
      try {
        const res = await fetchFromBackend(
          `/api/users/months/${currentUser.uid}/${currentYear}/${currentMonth}`,
        );
        setCurrentMonthData(res.month || null);
      } catch (err) {
        console.log("Error fetching month:", err);
        setCurrentMonthData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    try {
      const res = await fetchFromBackend("/api/users/months", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          year: currentYear,
          month: currentMonth,
          trackSleepModal,
          sleepTrackingStart,
        }),
      });
      setCurrentMonthData(res.month);
      if (!res.month.trackSleep) {
        setActiveTab("memorable");
        localStorage.setItem("activeTab", "memorable");
      }
      setIsOpen(false);
    } catch (err) {
      console.log("Error adding month:", err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "memorable":
        return <MemorableDay />;
      case "habits":
        return <HabitsToTrack />;
      case "sleep":
        if (!currentMonthData?.trackSleep) return null;
        return <SleepCycle startDate={currentMonthData.sleepTrackingStart} />;
      default:
        return null;
    }
  };

  if (loading) return <Loading />;

  const TABS = [
    { key: "memorable", label: "Memorable Day" },
    { key: "habits", label: "Habits" },
    ...(currentMonthData?.trackSleep
      ? [{ key: "sleep", label: "Sleep Cycle" }]
      : []),
  ];

  return (
    <div
      className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-10"
      style={{ overflowX: "hidden" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-6 w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-1"
        >
          <p className="text-xs uppercase tracking-widest font-medium text-accent-green">
            Habit Tracker
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-text">
            {currentMonthData
              ? DateTime.fromObject(
                  {
                    year: currentMonthData.year,
                    month: currentMonthData.month,
                  },
                  { zone: "America/Toronto" },
                ).toFormat("LLLL yyyy")
              : "Get Started"}
          </h1>
          <p className="text-sm text-sub-text">
            {currentMonthData
              ? "Track your habits, sleep and memorable days."
              : "You haven't started tracking this month yet."}
          </p>
        </motion.div>

        {currentMonthData ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-col rounded-2xl overflow-hidden max-w-full w-full"
            style={{
              border: "1px solid rgba(200,159,187,0.2)",
              boxShadow: "0 2px 24px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex gap-1 px-3 pt-3">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative px-4 py-2 rounded-t-xl text-sm font-medium transition-all ${
                    activeTab === key
                      ? "text-white z-10"
                      : "text-sub-text hover:text-text"
                  }`}
                  style={
                    activeTab === key
                      ? {
                          background:
                            "linear-gradient(135deg, #C89FBB, #a87d9a)",
                          marginBottom: "-1px",
                        }
                      : {
                          background: "rgba(200,159,187,0.1)",
                          border: "1px solid rgba(200,159,187,0.15)",
                          borderBottom: "none",
                        }
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <div
              className="relative rounded-b-2xl rounded-tr-2xl p-4 md:p-6 min-h-[60vh]"
              style={{
                background: "rgba(235,245,250,0.7)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                overflow: "hidden",
                contain: "layout paint",
              }}
            >
              <AnimatePresence mode="wait" custom={activeTab}>
                Replace with: jsx
                <motion.div
                  key={activeTab}
                  custom={activeTab}
                  initial={{ opacity: 0, x: 20, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.98 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  style={{
                    transformOrigin: "center",
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-4 py-24 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(200,159,187,0.15)" }}
            >
              <IoAddOutline size={28} style={{ color: "#C89FBB" }} />
            </div>
            <p className="text-text font-semibold">No tracking data yet</p>
            <p className="text-sm text-sub-text max-w-xs">
              Click the + button to start tracking your habits for this month.
            </p>
          </motion.div>
        )}
      </div>
      {!currentMonthData && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 md:bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center text-white z-40"
          style={{
            background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
            boxShadow: "0 8px 24px rgba(200,159,187,0.45)",
          }}
          onClick={() => setIsOpen(true)}
        >
          <IoAddOutline size={28} />
        </motion.button>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
              style={{
                background: "#ebf5fa",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <p
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: "#a87d9a" }}
                  >
                    New Month
                  </p>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "#0d2233" }}
                  >
                    Start Tracking
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:opacity-70"
                  style={{ background: "rgba(0,0,0,0.06)", color: "#5a7a8f" }}
                >
                  <AiOutlineClose size={16} />
                </button>
              </div>

              <div
                className="h-px"
                style={{ background: "rgba(0,0,0,0.08)" }}
              />

              <form onSubmit={handleAdd} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: "#5a7a8f" }}
                  >
                    Year
                  </label>
                  <input
                    type="number"
                    value={currentYear}
                    readOnly
                    className="px-4 py-2.5 rounded-xl text-sm font-medium outline-none"
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      color: "#0d2233",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: "#5a7a8f" }}
                  >
                    Month
                  </label>
                  <input
                    type="text"
                    value={nowToronto.toFormat("LLLL yyyy")}
                    readOnly
                    className="px-4 py-2.5 rounded-xl text-sm font-medium outline-none"
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      color: "#0d2233",
                    }}
                  />
                </div>

                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer"
                  style={{
                    background: trackSleepModal
                      ? "rgba(200,159,187,0.15)"
                      : "rgba(0,0,0,0.03)",
                    border: trackSleepModal
                      ? "1px solid rgba(200,159,187,0.35)"
                      : "1px solid rgba(0,0,0,0.07)",
                  }}
                  onClick={() => setTrackSleepModal((prev) => !prev)}
                >
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#0d2233" }}
                    >
                      Track Sleep
                    </span>
                    <span className="text-xs" style={{ color: "#5a7a8f" }}>
                      Log your sleep cycle this month
                    </span>
                  </div>
                  <div
                    className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
                    style={{
                      background: trackSleepModal
                        ? "linear-gradient(135deg, #C89FBB, #a87d9a)"
                        : "rgba(0,0,0,0.15)",
                    }}
                  >
                    <motion.div
                      animate={{ x: trackSleepModal ? 16 : 2 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white"
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-1"
                  style={{
                    background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
                    boxShadow: "0 8px 24px rgba(200,159,187,0.35)",
                  }}
                >
                  Start This Month
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitTrack;
