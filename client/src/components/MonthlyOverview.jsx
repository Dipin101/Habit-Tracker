import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchFromBackend } from "../api";
import { motion } from "framer-motion";

const MonthlyOverview = () => {
  const [monthlyData, setMonthlyData] = useState({
    totalHabits: 0,
    completionPercent: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const overview = await fetchFromBackend("/api/users/monthly-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid }),
      });
      setMonthlyData(overview);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest text-sub-text font-medium">
        Monthly Overview
      </p>
      <p className="text-2xl font-bold text-text">{monthlyData.totalHabits}</p>
      <p className="text-xs text-sub-text">Habits this month</p>
      <div className="mt-2">
        <div className="flex justify-between text-xs text-sub-text mb-1">
          <span>Completion</span>
          <span>{monthlyData.completionPercent}%</span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(0,0,0,0.06)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${monthlyData.completionPercent}%` }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #C89FBB, #a87d9a)" }}
          />
        </div>
      </div>
    </div>
  );
};

export default MonthlyOverview;
