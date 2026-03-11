import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchFromBackend } from "../api";
import { motion } from "framer-motion";

const statusConfig = {
  completed: { color: "#93B5A0", label: "✓" },
  "in progress": { color: "#F4A261", label: "⟳" },
  "not completed": { color: "#e07070", label: "✗" },
};

const TodayHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const res = await fetchFromBackend("/api/users/today-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
      setHabits(res.habits || []);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const completed = habits.filter((h) => h.status === "completed").length;

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-sub-text font-medium">
          Today's Habits
        </p>
        {!loading && habits.length > 0 && (
          <span className="text-xs font-semibold text-text">
            {completed}/{habits.length}
          </span>
        )}
      </div>

      {!loading && habits.length > 0 && (
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(0,0,0,0.06)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.round((completed / habits.length) * 100)}%`,
            }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #93B5A0, #6a9e80)" }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-xs text-sub-text">Loading...</p>
      ) : habits.length === 0 ? (
        <p className="text-sm text-sub-text">No habits tracked yet today.</p>
      ) : (
        <div
          className="flex flex-col gap-2 overflow-y-auto pr-1"
          style={{ maxHeight: "120px" }}
        >
          {habits.map((habit, i) => {
            const config =
              statusConfig[habit.status] || statusConfig["in progress"];
            return (
              <motion.div
                key={habit._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-xs text-text truncate">{habit.name}</span>
                <span
                  className="text-xs font-bold flex-shrink-0"
                  style={{ color: config.color }}
                >
                  {config.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodayHabits;
