import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchFromBackend } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import NotebookCard from "../components/analytics/NotebookCard";
import Legend from "../components/analytics/Legend";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Analytics = () => {
  const [monthsData, setMonthsData] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [zooming, setZooming] = useState(null);
  const navigate = useNavigate();

  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const res = await fetchFromBackend(
          `/api/users/months-summary/${user.uid}/${currentYear}`,
        );
        if (res.months) {
          setMonthsData(
            new Map(res.months.map((m) => [m.month, m.completion])),
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const getStatus = (i) => {
    const s = String(i + 1).padStart(2, "0");
    if (i === currentMonthIndex) return "current";
    if (i > currentMonthIndex) return "future";
    if (monthsData.has(s)) return "data";
    return "empty";
  };

  const getCompletion = (i) =>
    monthsData.get(String(i + 1).padStart(2, "0")) ?? 0;

  const handleSelect = (monthName, year) => {
    if (zooming) return;
    const monthIndex = MONTHS.indexOf(monthName);
    const monthStr = String(monthIndex + 1).padStart(2, "0");
    setZooming({ month: monthName, year, monthStr });
    setTimeout(() => navigate(`/dashboard/analytics/${year}/${monthStr}`), 800);
  };

  return (
    <div className="relative min-h-screen bg-background px-4 py-8 md:px-8 md:py-10 overflow-hidden">
      <AnimatePresence>
        {zooming && (
          <motion.div
            className="fixed inset-0 bg-background z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      <motion.div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent-green">
            Analytics
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-text">
            Your Year at a Glance
          </h1>
          <p className="text-sm text-sub-text">
            Darker notebooks = more days tracked.
          </p>
        </div>

        <Legend />

        {loading ? (
          <div className="py-16 text-center text-sub-text">
            Loading notebooks...
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 md:gap-5">
            {MONTHS.map((month, i) => (
              <NotebookCard
                key={month}
                month={month}
                year={currentYear}
                status={getStatus(i)}
                completion={getCompletion(i)}
                index={i}
                onSelect={handleSelect}
                zooming={zooming}
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {zooming && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center text-3xl font-bold text-text pointer-events-none z-50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              Opening {zooming.month} {zooming.year}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Analytics;
