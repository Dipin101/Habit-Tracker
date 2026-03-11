import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { fetchFromBackend } from "../api";
import { motion } from "framer-motion";

const CompletionCard = () => {
  const [habits, setHabits] = useState([]);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    if (!habits || habits.length === 0) {
      setCompletion(0);
      return;
    }
    const completed = habits.filter((h) => h.status === "completed").length;
    setCompletion(Math.round((completed / habits.length) * 100));
  }, [habits]);

  useEffect(() => {
    const fetchHabits = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const res = await fetchFromBackend("/api/users/today-completion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid }),
        });
        setHabits(res.habits || []);
      } catch (err) {
        console.error("Error fetching today's habits:", err);
      }
    };
    fetchHabits();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest text-sub-text font-medium">
        Today's Completion
      </p>

      <p className="text-xl md:text-2xl font-bold text-text">
        {completion}
        <span className="text-sm md:text-base font-medium text-sub-text">
          %
        </span>
      </p>

      <p className="text-xs text-sub-text">
        {habits.length === 0
          ? "No habits tracked yet"
          : `${habits.filter((h) => h.status === "completed").length} of ${habits.length} completed`}
      </p>

      <div className="mt-1">
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(0,0,0,0.06)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #C89FBB, #a87d9a)" }}
          />
        </div>
      </div>
    </div>
  );
};

export default CompletionCard;
