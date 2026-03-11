import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchFromBackend } from "../api";
import HabitsTab from "../components/monthAnalytics/tabs/HabitsTab";
import SleepTab from "../components/monthAnalytics/tabs/SleepTab";
import MoodTab from "../components/monthAnalytics/tabs/MoodTab";
import MemorableTab from "../components/monthAnalytics/tabs/MemorableTab";

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const TABS = [
  { id: "habits", label: "Habits" },
  { id: "sleep", label: "Sleep" },
  { id: "mood", label: "Mood" },
  { id: "memorable", label: "Memorable" },
];

const AnalyticsMonth = () => {
  const { year, month, tab } = useParams();
  const navigate = useNavigate();
  const [monthData, setMonthData] = useState(null);
  const savedTab = localStorage.getItem(`tab-${year}-${month}`);
  const [activeTab, setActiveTab] = useState(tab ?? savedTab ?? "habits");
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [sleep, setSleep] = useState([]);
  const [mood, setMood] = useState([]);
  const [memorable, setMemorable] = useState([]);
  const [userName, setUserName] = useState("");

  const monthIndex = parseInt(month, 10) - 1;
  const monthName = FULL_MONTHS[monthIndex];
  const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem(`tab-${year}-${month}`, tabId);
    navigate(`/dashboard/analytics/${year}/${month}/${tabId}`, {
      replace: true,
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const [res, monthRes, profileRes] = await Promise.all([
          fetchFromBackend(`/api/users/analytics/${user.uid}/${year}/${month}`),
          fetchFromBackend(`/api/users/months/${user.uid}/${year}/${month}`),
          fetchFromBackend("/api/users/getProfile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${await user.getIdToken()}`,
            },
          }),
        ]);
        setMonthData(monthRes.month ?? null);
        setHabits(res.habits ?? []);
        setSleep(res.sleep ?? []);
        setMood(res.mood ?? []);
        setMemorable(res.memorable ?? []);
        const { firstName } = profileRes.userData;
        setUserName(`${firstName ?? ""}`.trim());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [year, month]);

  const handleEnableSleep = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await fetchFromBackend("/api/users/months", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        year,
        month,
        trackSleepModal: true,
        sleepTrackingStart: new Date().toISOString(),
      }),
    });
    setMonthData((prev) => ({ ...prev, trackSleep: true }));
  };

  const generateReport = ({
    habits,
    sleep,
    mood,
    memorable,
    monthName,
    year,
    daysInMonth,
    userName,
  }) => {
    const MOOD_CONFIG = {
      5: { emoji: "😄", label: "Great", color: "#6a9980" },
      4: { emoji: "🙂", label: "Good", color: "#93B5A0" },
      3: { emoji: "😐", label: "Okay", color: "#C8B97A" },
      2: { emoji: "😕", label: "Bad", color: "#C89FBB" },
      1: { emoji: "😞", label: "Awful", color: "#e88080" },
    };

    const habitPct = habits.length
      ? Math.round(
          (habits.reduce((s, h) => s + h.completedDays.length, 0) /
            (habits.length * daysInMonth)) *
            100,
        )
      : 0;
    const avgSleep = sleep.length
      ? (sleep.reduce((s, d) => s + d.hours, 0) / sleep.length).toFixed(1)
      : null;
    const avgMood = mood.length
      ? (mood.reduce((s, d) => s + d.score, 0) / mood.length).toFixed(1)
      : null;
    const avgMoodCfg = avgMood
      ? MOOD_CONFIG[Math.round(parseFloat(avgMood))]
      : null;
    const sleepGoalDays = sleep.filter((d) => d.hours >= 7).length;
    const bestHabit = habits.length
      ? habits.reduce(
          (b, h) => (h.completedDays.length > b.completedDays.length ? h : b),
          habits[0],
        )
      : null;
    const worstHabit = habits.length
      ? habits.reduce(
          (w, h) => (h.completedDays.length < w.completedDays.length ? h : w),
          habits[0],
        )
      : null;

    const habitGrid = habits
      .map((h) => {
        const pct = Math.round((h.completedDays.length / daysInMonth) * 100);
        const cells = [...Array(daysInMonth)]
          .map((_, i) => {
            const done = h.completedDays.includes(i + 1);
            return `<div style="width:10px;height:10px;border-radius:2px;flex-shrink:0;background:${done ? "#93B5A0" : "rgba(200,159,187,0.2)"}"></div>`;
          })
          .join("");
        return `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;page-break-inside:avoid;">
        <div style="width:140px;flex-shrink:0;">
          <div style="font-size:11px;font-weight:600;color:#0d2233;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${h.name}</div>
          <div style="font-size:9px;color:#5a7a8f;">${pct}%</div>
        </div>
        <div style="display:flex;gap:2px;flex-wrap:nowrap;">${cells}</div>
      </div>`;
      })
      .join("");

    const sleepBars = sleep.length
      ? sleep
          .map((d) => {
            const pct = Math.min((d.hours / 10) * 100, 100);
            const color =
              d.hours >= 8
                ? "#6a9980"
                : d.hours >= 7
                  ? "#93B5A0"
                  : d.hours >= 6
                    ? "#C89FBB"
                    : "#e88080";
            return `
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;page-break-inside:avoid;">
            <div style="width:20px;font-size:9px;color:#5a7a8f;text-align:right;">${d.day}</div>
            <div style="flex:1;height:8px;background:rgba(0,0,0,0.06);border-radius:4px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;"></div>
            </div>
            <div style="width:28px;font-size:9px;color:#0d2233;font-weight:600;">${d.hours}h</div>
          </div>`;
          })
          .join("")
      : `<p style="color:#aaa;font-size:12px;font-style:italic;">No sleep data recorded</p>`;

    const moodDots = [...Array(daysInMonth)]
      .map((_, i) => {
        const day = i + 1;
        const m = mood.find((d) => d.day === day);
        const cfg = m ? MOOD_CONFIG[m.score] : null;
        return `
      <div style="width:28px;height:28px;border-radius:8px;background:${cfg ? cfg.color + "30" : "rgba(0,0,0,0.04)"};display:flex;align-items:center;justify-content:center;">
        ${cfg ? `<span style="font-size:14px;">${cfg.emoji}</span>` : `<span style="font-size:8px;color:#ccc;">${day}</span>`}
      </div>`;
      })
      .join("");

    const moodLegend = Object.entries(MOOD_CONFIG)
      .reverse()
      .map(
        ([, cfg]) => `
    <div style="display:flex;align-items:center;gap:4px;">
      <span style="font-size:12px;">${cfg.emoji}</span>
      <span style="font-size:10px;color:#5a7a8f;">${cfg.label}</span>
    </div>`,
      )
      .join("");

    const memorableEntries = memorable.length
      ? memorable
          .map(
            (m) => `
        <div style="padding:14px 16px;border-radius:12px;background:rgba(200,159,187,0.08);border:1px solid rgba(200,159,187,0.2);margin-bottom:10px;page-break-inside:avoid;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <div style="font-size:10px;color:#a87d9a;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">${monthName} ${m.day}</div>
            <div style="font-size:13px;font-weight:700;color:#0d2233;">${m.title}</div>
          </div>
          <div style="font-size:12px;color:#5a7a8f;line-height:1.6;">${m.journal}</div>
        </div>`,
          )
          .join("")
      : `<p style="color:#aaa;font-size:12px;font-style:italic;">No memorable moments recorded</p>`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${userName}_${monthName}_${year}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: white; color: #0d2233; }
    @media print {
      html, body { height: auto; }
      .page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; max-width: 100% !important; }
    }
    .page { background: white; max-width: 800px; margin: 24px auto; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
    .header { background: linear-gradient(135deg, #C89FBB, #a87d9a); padding: 40px 48px; color: white; }
    .section { padding: 28px 48px; border-bottom: 1px solid rgba(0,0,0,0.06); page-break-inside: avoid; }
    .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; color: #93B5A0; margin-bottom: 16px; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .stat-card { background: #f8fbfd; border-radius: 12px; padding: 16px; border: 1px solid rgba(0,0,0,0.05); }
    .stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; color: #5a7a8f; font-weight: 600; margin-bottom: 4px; }
    .stat-value { font-size: 22px; font-weight: 900; color: #0d2233; }
    .stat-sub { font-size: 10px; color: #5a7a8f; margin-top: 2px; }
    .insight-box { background: rgba(147,181,160,0.1); border: 1px solid rgba(147,181,160,0.25); border-radius: 12px; padding: 14px 16px; margin-top: 16px; }
    .insight-text { font-size: 12px; color: #0d2233; line-height: 1.6; }
    .footer { padding: 20px 48px; text-align: center; }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <div style="font-size:11px;opacity:0.8;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">Monthly Report</div>
      <div style="font-size:36px;font-weight:900;margin-bottom:4px;">${monthName} ${year}</div>
      <div style="font-size:14px;opacity:0.85;">${userName || "Habit Tracker User"}</div>
    </div>

    <!-- Overview -->
    <div class="section">
      <div class="section-title">Overview</div>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">Habit Score</div>
          <div class="stat-value" style="color:#93B5A0;">${habitPct}%</div>
          <div class="stat-sub">${habits.length} habits tracked</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Mood</div>
          <div class="stat-value">${avgMoodCfg ? avgMoodCfg.emoji : "—"}</div>
          <div class="stat-sub">${avgMood ? avgMood + "/5 · " + avgMoodCfg?.label : "No data"}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Sleep</div>
          <div class="stat-value" style="color:#5a7a8f;">${avgSleep ? avgSleep + "h" : "—"}</div>
          <div class="stat-sub">${sleepGoalDays} nights ≥7h</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Memorable</div>
          <div class="stat-value" style="color:#C89FBB;">${memorable.length}</div>
          <div class="stat-sub">moments logged</div>
        </div>
      </div>
      ${
        bestHabit
          ? `
      <div class="insight-box">
        <div class="insight-text">
          💪 <strong>Best habit:</strong> ${bestHabit.name} — completed ${bestHabit.completedDays.length} of ${daysInMonth} days
          ${worstHabit && worstHabit.name !== bestHabit.name ? `&nbsp;·&nbsp; 🎯 <strong>Focus on:</strong> ${worstHabit.name} — only ${worstHabit.completedDays.length} days` : ""}
        </div>
      </div>`
          : ""
      }
    </div>

    <!-- Mood Calendar -->
    <div class="section">
      <div class="section-title">Mood Calendar</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">${moodDots}</div>
      <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;">${moodLegend}</div>
      ${
        avgMood
          ? `
      <div class="insight-box" style="margin-top:16px;">
        <div class="insight-text">
          ${avgMoodCfg?.emoji} Your average mood this month was <strong>${avgMood}/5</strong> — <strong>${avgMoodCfg?.label}</strong>.
          You logged mood on <strong>${mood.length}</strong> days.
        </div>
      </div>`
          : ""
      }
    </div>

    <!-- Habits -->
    <div class="section">
      <div class="section-title">Habit Tracker</div>
      ${habitGrid || `<p style="color:#aaa;font-size:12px;font-style:italic;">No habits recorded</p>`}
      <div style="display:flex;gap:16px;margin-top:12px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <div style="width:10px;height:10px;border-radius:2px;background:#93B5A0;"></div>
          <span style="font-size:10px;color:#5a7a8f;">Completed</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <div style="width:10px;height:10px;border-radius:2px;background:rgba(200,159,187,0.3);"></div>
          <span style="font-size:10px;color:#5a7a8f;">Missed</span>
        </div>
      </div>
    </div>

    <!-- Sleep -->
    <div class="section">
      <div class="section-title">Sleep</div>
      <div style="columns:2;column-gap:24px;">${sleepBars}</div>
      ${
        avgSleep
          ? `
      <div class="insight-box" style="margin-top:16px;">
        <div class="insight-text">
          🌙 You averaged <strong>${avgSleep}h</strong> of sleep and hit the 7h goal on <strong>${sleepGoalDays} of ${sleep.length}</strong> tracked nights.
        </div>
      </div>`
          : ""
      }
    </div>

    <!-- Memorable -->
    <div class="section">
      <div class="section-title">Memorable Moments</div>
      ${memorableEntries}
    </div>

    <div class="footer">
      <div style="font-size:10px;color:#aaa;">Generated by OneApp · ${monthName} ${year} · ${userName || ""}</div>
    </div>

  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#ebf5fa" }}
      >
        <p style={{ color: "#5a7a8f", fontSize: "14px" }}>
          Loading {monthName}...
        </p>
      </div>
    );

  return (
    <div
      className="min-h-screen px-4 py-8 md:px-8 md:py-10"
      style={{ background: "#ebf5fa" }}
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/analytics")}
              className="flex items-center justify-center w-9 h-9 rounded-full"
              style={{ background: "rgba(0,0,0,0.05)" }}
            >
              <span style={{ color: "#5a7a8f" }}>←</span>
            </button>
            <div>
              <p
                style={{
                  color: "#93B5A0",
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                {year}
              </p>
              <h1 className="text-2xl font-black" style={{ color: "#0d2233" }}>
                {monthName}
              </h1>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              generateReport({
                habits,
                sleep,
                mood,
                memorable,
                monthName,
                year,
                daysInMonth,
                userName,
              })
            }
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
              color: "white",
              boxShadow: "0 4px 16px rgba(200,159,187,0.35)",
            }}
          >
            <span>📄</span>
            <span>Export Report</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-1 p-1 rounded-2xl"
          style={{ background: "rgba(0,0,0,0.05)" }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold relative"
            >
              {activeTab === t.id && (
                <motion.div
                  layoutId="tabBg"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
              )}
              <span
                className="relative z-10"
                style={{ color: activeTab === t.id ? "#0d2233" : "#5a7a8f" }}
              >
                {t.label}
              </span>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "habits" && (
            <HabitsTab
              key="h"
              habits={habits}
              daysInMonth={daysInMonth}
              monthName={monthName}
              year={year}
            />
          )}
          {activeTab === "sleep" && (
            <SleepTab
              key="s"
              data={sleep}
              daysInMonth={daysInMonth}
              trackSleepEnabled={monthData?.trackSleep ?? false}
              onEnableSleep={handleEnableSleep}
            />
          )}
          {activeTab === "mood" && (
            <MoodTab
              key="m"
              moodData={mood}
              sleepData={sleep}
              habitData={habits}
              memorableData={memorable}
              daysInMonth={daysInMonth}
              monthName={monthName}
              year={year}
            />
          )}
          {activeTab === "memorable" && (
            <MemorableTab
              key="mem"
              data={memorable}
              monthName={monthName}
              year={year}
              daysInMonth={daysInMonth}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnalyticsMonth;
