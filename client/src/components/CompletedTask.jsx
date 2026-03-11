import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchFromBackend } from "../api";
import { motion } from "framer-motion";

const CompletedTask = () => {
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
      // only show completed ones
      const completed = (res.habits || []).filter(
        (h) => h.status === "completed",
      );
      setHabits(completed);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full">
      <p className="text-xs uppercase tracking-widest text-sub-text font-medium">
        Completed Today
      </p>

      {loading ? (
        <p className="text-xs text-sub-text">Loading...</p>
      ) : habits.length === 0 ? (
        <p className="text-sm text-sub-text">Nothing completed yet today.</p>
      ) : (
        <div
          className="flex flex-col gap-2 overflow-y-auto pr-1"
          style={{ maxHeight: "120px" }}
        >
          {habits.map((habit, i) => (
            <motion.div
              key={habit._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "#93B5A0" }}
              />
              <span className="text-xs text-text truncate">{habit.name}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedTask;
