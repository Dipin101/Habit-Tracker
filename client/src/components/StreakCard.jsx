import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { DateTime } from "luxon";
import { fetchFromBackend } from "../api";
import { motion } from "framer-motion";
import { MdLocalFireDepartment } from "react-icons/md";

const streakMessages = [
  "Keep going!",
  "Don't break it!",
  "You're on fire!",
  "Let's go!",
  "Stay consistent!",
];

const StreakCard = () => {
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStreak = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const today = DateTime.now().setZone("America/Toronto").toISODate();

      try {
        const data = await fetchFromBackend("/api/users/streak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid, today }),
        });

        setStreak(data.streak);
        const msgIdx = Math.min(data.streak, streakMessages.length - 1);
        setMessage(streakMessages[msgIdx]);
      } catch (err) {
        console.error("Error fetching streak:", err);
      }
    };

    fetchStreak();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest text-sub-text font-medium">
        Current Streak
      </p>

      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: streak > 0 ? [1, 1.2, 1] : 1 }}
          transition={{
            duration: 0.5,
            repeat: streak > 0 ? Infinity : 0,
            repeatDelay: 2,
          }}
        >
          <MdLocalFireDepartment
            size={28}
            style={{ color: streak > 0 ? "#f97316" : "#93B5A0" }}
          />
        </motion.div>
        <p className="text-2xl font-bold text-text">
          {streak}{" "}
          <span className="text-base font-medium text-sub-text">
            {streak === 1 ? "day" : "days"}
          </span>
        </p>
      </div>

      <p className="text-xs text-sub-text">{message || "Start your streak!"}</p>

      {/* Mini streak bar */}
      <div className="flex gap-1 mt-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{
              background:
                i < streak % 7
                  ? "linear-gradient(90deg, #C89FBB, #a87d9a)"
                  : "rgba(0,0,0,0.06)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default StreakCard;
