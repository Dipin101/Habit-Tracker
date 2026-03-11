import React, { useRef, useState, useEffect, useMemo } from "react";
import { auth } from "../firebase";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { DateTime } from "luxon";
import { fetchFromBackend } from "../api";
import { motion, AnimatePresence } from "framer-motion";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
);

const SleepCycle = ({ startDate }) => {
  const chartRef = useRef();
  const debounceSave = useRef(null);

  const start = DateTime.fromISO(startDate, { zone: "America/Toronto" });
  const year = start.year;
  const month = start.month;
  const totalDays = start.endOf("month").day;

  const labels = useMemo(() => {
    const arr = [];
    for (let d = start.day; d <= totalDays; d++) arr.push(d);
    return arr;
  }, [startDate, start.day, totalDays]);

  const [sleepData, setSleepData] = useState(Array(labels.length).fill(null));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSleepData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const data = await fetchFromBackend(
          `/api/users/sleep/${user.uid}/${year}/${month}`,
        );
        const newSleepData = labels.map((day) => {
          const record = data.find((d) => Number(d.day) === day);
          return record ? record.hours / 60 : null;
        });
        setSleepData(newSleepData);
      } catch (err) {
        console.error("Error fetching sleep data:", err);
        setSleepData(Array(labels.length).fill(null));
      }
    };
    fetchSleepData();
  }, [labels, year, month]);

  const postSleep = async (day, hours) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const sleepMinutes = Math.round(hours * 60);
      await fetchFromBackend("/api/users/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          year: start.year,
          month: String(month).padStart(2, "0"),
          day: String(day).padStart(2, "0"),
          hour: sleepMinutes,
        }),
      });
    } catch (err) {
      console.error("Error saving sleep:", err);
      setErrorMessage("Failed to save sleep. Try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const getColor = (value) => {
    if (value === null) return "#C89FBB";
    if (value < 7) return "#dc2626";
    if (value <= 9) return "#93B5A0";
    return "#5a7a8f";
  };

  const data = {
    labels,
    datasets: [
      {
        label: "Sleep Hours",
        data: sleepData,
        borderColor: "rgba(200,159,187,0.6)",
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: (ctx) => getColor(ctx.raw),
        pointBorderColor: "rgba(255,255,255,0.8)",
        pointBorderWidth: 2,
        segment: {
          borderColor: (ctx) => getColor(ctx.p0.parsed.y),
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 12,
        ticks: {
          stepSize: 1,
          color: "#5a7a8f",
          font: { size: 11, family: "Poppins" },
        },
        title: {
          display: true,
          text: "Hours Slept",
          color: "#5a7a8f",
          font: { size: 11, family: "Poppins" },
        },
        grid: { color: "rgba(0,0,0,0.04)" },
        border: { color: "rgba(0,0,0,0.06)" },
      },
      x: {
        offset: true,
        ticks: {
          color: "#5a7a8f",
          font: { size: 11, family: "Poppins" },
          maxRotation: 0,
        },
        title: {
          display: true,
          text: "Days of the Month",
          color: "#5a7a8f",
          font: { size: 11, family: "Poppins" },
        },
        grid: { color: "rgba(0,0,0,0.04)" },
        border: { color: "rgba(0,0,0,0.06)" },
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: "#ebf5fa",
        titleColor: "#0d2233",
        bodyColor: "#5a7a8f",
        borderColor: "rgba(200,159,187,0.3)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.raw} hrs`,
        },
      },
    },
  };

  const handleClick = (event) => {
    const chart = chartRef.current;
    if (!chart) return;
    const canvas = chart.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    if (!xScale || !yScale) return;

    let dayIndex = Math.round(xScale.getValueForPixel(x));
    dayIndex = Math.max(0, Math.min(dayIndex, labels.length - 1));
    const clickedDay = labels[dayIndex];
    const today = DateTime.now().setZone("America/Toronto").day;

    if (clickedDay > today) {
      setErrorMessage("You can only edit sleep for today!");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    if (clickedDay < today && sleepData[dayIndex] !== null) {
      setErrorMessage("Past sleep data is locked.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    let hours = parseFloat(yScale.getValueForPixel(y).toFixed(1));
    hours = Math.min(Math.max(hours, 0), 12);
    const newData = [...sleepData];
    newData[dayIndex] = hours;
    setSleepData(newData);

    if (debounceSave.current) clearTimeout(debounceSave.current);
    debounceSave.current = setTimeout(() => postSleep(clickedDay, hours), 500);
  };

  const legend = [
    { color: "#dc2626", label: "0–7 hrs", sub: "Low Sleep" },
    { color: "#93B5A0", label: "7–9 hrs", sub: "Optimum" },
    { color: "#5a7a8f", label: "9+ hrs", sub: "Too Much" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest font-medium text-accent-green">
          Sleep Cycle
        </p>
        <h2 className="text-xl md:text-2xl font-bold text-text">
          {DateTime.fromObject({ year, month }).toFormat("LLLL yyyy")}
        </h2>
        <p className="text-sm text-sub-text">
          Click on the chart to log your sleep hours for today.
        </p>
      </div>

      <AnimatePresence>
        {errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs px-4 py-2 rounded-xl"
            style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      <div
        className="w-full rounded-2xl p-4 md:p-8"
        style={{
          background: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        <p className="text-xs text-sub-text mb-3 md:hidden">
          ← Scroll to view full chart →
        </p>

        <div
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div style={{ minWidth: "560px", height: "500px" }}>
            <Line
              ref={chartRef}
              data={data}
              options={options}
              onClick={handleClick}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:flex-wrap gap-2 w-full">
        {legend.map(({ color, label, sub }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium w-full md:w-auto"
            style={{
              background: `${color}18`,
              border: `1px solid ${color}40`,
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: color }}
            />
            <span style={{ color: "#0d2233" }}>{label}</span>
            <span style={{ color: "#5a7a8f" }}>· {sub}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SleepCycle;
