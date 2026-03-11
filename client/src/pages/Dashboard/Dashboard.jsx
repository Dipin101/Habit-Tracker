import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import QuoteCard from "../../components/QuoteCard";
import StreakCard from "../../components/StreakCard";
import CompletionCard from "../../components/CompletionCard";
import SleepCompletion from "../../components/SleepCompletion";
import { fetchFromBackend } from "../../api";
import { motion } from "framer-motion";
import MonthlyOverview from "../../components/MonthlyOverview";
import TodayHabits from "../../components/TodayHabits";
import CompletedTask from "../../components/CompletedTask";
import MoodMeter from "../../components/MoodMeter";
import { Link } from "react-router-dom";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const Dashboard = () => {
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [hasMonth, setHasMonth] = useState(null); // null = loading, true/false = known
  const [creatingMonth, setCreatingMonth] = useState(false);

  const currentMonth = new Date().toLocaleString("default", { month: "long" }); // e.g. "March"
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const year = new Date().getFullYear();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUserId(user.uid);

      // fetch user name
      const idToken = await user.getIdToken();
      const userRes = await fetchFromBackend("/api/users/getUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      setUserName(userRes.name);

      // check if current month exists
      try {
        const monthRes = await fetchFromBackend(
          `/api/users/months/${user.uid}/${year}/${month}`,
        );
        // if we get data back and it has content, month exists
        setHasMonth(!!monthRes);
      } catch {
        // 404 or any error = no month yet
        setHasMonth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCreateMonth = async () => {
    setCreatingMonth(true);
    try {
      await fetchFromBackend("/api/users/months", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: userId, month, year }),
      });
      setHasMonth(true);
    } catch (e) {
      console.error("Failed to create month:", e);
    } finally {
      setCreatingMonth(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-10 overflow-auto">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header — always visible */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-1"
        >
          <p className="text-xs uppercase tracking-widest font-medium text-accent-green">
            Dashboard
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-text">
            Welcome back, {userName || "there"} 👋
          </h1>
          <p className="text-sm text-sub-text">
            Track your progress and stay consistent.
          </p>
        </motion.div>

        {/* Quote — always visible */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <QuoteCard />
        </motion.div>

        {/* Month gate */}
        {hasMonth === null ? (
          // Loading state
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm text-sub-text tracking-widest uppercase"
            >
              Loading your data...
            </motion.div>
          </div>
        ) : hasMonth === false ? (
          // No month yet — prompt to create
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center gap-5 py-16 text-center"
          >
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: "rgba(200,159,187,0.12)",
                border: "1px solid rgba(200,159,187,0.25)",
              }}
            >
              📅
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-text">
                No data for {currentMonth} yet
              </h2>
              <p className="text-sm text-sub-text max-w-xs">
                Start tracking this month to see your streaks, habits, sleep,
                and mood all in one place.
              </p>
            </div>
            <Link to="/dashboard/habittrack">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateMonth}
                disabled={creatingMonth}
                className="px-8 py-3 rounded-full text-white text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
                  boxShadow: "0 8px 24px rgba(200,159,187,0.35)",
                  opacity: creatingMonth ? 0.7 : 1,
                }}
              >
                {creatingMonth
                  ? "Setting up..."
                  : `Start tracking ${currentMonth} 🚀`}
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          // Has month — show full dashboard
          <>
            {/* Mood */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-card rounded-2xl p-5"
              style={{
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              }}
            >
              <MoodMeter />
            </motion.div>

            {/* Section label */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-sub-text font-medium">
                Today's Overview
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(0,0,0,0.06)" }}
              />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { component: <StreakCard />, i: 0 },
                { component: <CompletionCard />, i: 1 },
                { component: <SleepCompletion />, i: 2 },
                { component: <MonthlyOverview />, i: 3 },
              ].map(({ component, i }) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-card rounded-2xl p-5"
                  style={{
                    border: "1px solid rgba(255,255,255,0.6)",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                  }}
                >
                  {component}
                </motion.div>
              ))}
            </div>

            {/* Bottom section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TodayHabits />
              <CompletedTask />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
