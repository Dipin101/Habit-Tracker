import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import QuoteCard from "../../components/QuoteCard";
import StreakCard from "../../components/StreakCard";
import CompletionCard from "../../components/CompletionCard";
import SleepCompletion from "../../components/SleepCompletion";
import { fetchFromBackend } from "../../api";
import { motion } from "framer-motion";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const idToken = await user.getIdToken();
      const res = await fetchFromBackend("/api/users/getUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      setUserName(res.name);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-10 overflow-auto">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header */}
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

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <QuoteCard />
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
            {
              component: (
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-widest text-sub-text font-medium">
                    Monthly Overview
                  </p>
                  <p className="text-2xl font-bold text-text">12</p>
                  <p className="text-xs text-sub-text">Goals set this month</p>
                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-sub-text mb-1">
                      <span>Completion</span>
                      <span>75%</span>
                    </div>
                    <div
                      className="w-full h-1.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(0,0,0,0.06)" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "75%" }}
                        transition={{
                          delay: 0.6,
                          duration: 0.8,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, #C89FBB, #a87d9a)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ),
              i: 3,
            },
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

        {/* Bottom section — placeholder for future widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-card rounded-2xl p-6 flex flex-col gap-3"
            style={{
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              minHeight: "160px",
            }}
          >
            <p className="text-xs uppercase tracking-widest text-sub-text font-medium">
              Today's Habits
            </p>
            <p className="text-sm text-sub-text">
              No habits tracked yet today.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-card rounded-2xl p-6 flex flex-col gap-3"
            style={{
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              minHeight: "160px",
            }}
          >
            <p className="text-xs uppercase tracking-widest text-sub-text font-medium">
              Recent Activity
            </p>
            <p className="text-sm text-sub-text">No recent activity yet.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
