import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { DateTime } from "luxon";
import { fetchFromBackend } from "../api";
import { motion } from "framer-motion";

const MonthlySleepCompletion = () => {
  const [completionPercent, setCompletionPercent] = useState(0);
  const [averageHours, setAverageHours] = useState(0);

  useEffect(() => {
    const fetchSleepData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const nowToronto = DateTime.now().setZone("America/Toronto");
      const currentYear = nowToronto.year;
      const currentMonth = String(nowToronto.month).padStart(2, "0");

      try {
        const data = await fetchFromBackend(
          `/api/users/avgsleep/${user.uid}/${currentYear}/${currentMonth}`,
        );
        const monthData = data.month;

        if (!monthData?.sleep || monthData.sleep.length === 0) {
          setCompletionPercent(0);
          setAverageHours(0);
          return;
        }

        const totalMinutes = monthData.sleep.reduce(
          (sum, day) => sum + (day.hours || 0),
          0,
        );
        const daysTracked = monthData.sleep.length;
        const avgHours = totalMinutes / 60 / daysTracked;
        const percent = Math.min(Math.round((avgHours / 8) * 100), 100);

        setAverageHours(avgHours.toFixed(1));
        setCompletionPercent(percent);
      } catch (err) {
        console.error("Error fetching sleep data:", err);
        setCompletionPercent(0);
        setAverageHours(0);
      }
    };

    fetchSleepData();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <p className="text-xs uppercase tracking-widest text-sub-text font-medium">
        Avg Sleep (Month)
      </p>

      {/* Main value */}
      <p className="text-2xl font-bold text-text">
        {averageHours}{" "}
        <span className="text-base font-medium text-sub-text">hrs</span>
      </p>

      {/* Aim note */}
      <p className="text-xs text-sub-text">Aim for 7–8 hrs daily</p>

      {/* Progress bar */}
      <div className="mt-1">
        <div className="flex justify-between text-xs text-sub-text mb-1">
          <span>Completion</span>
          <span>{completionPercent}%</span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(0,0,0,0.06)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #93B5A0, #6a9e85)" }}
          />
        </div>
      </div>
    </div>
  );
};

export default MonthlySleepCompletion;
