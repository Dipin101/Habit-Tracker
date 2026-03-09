import React from "react";
import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { fetchFromBackend } from "../api";
import { motion } from "framer-motion";

const QuoteCard = () => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  const fetchQuote = async () => {
    try {
      const data = await fetchFromBackend("/api/users/quote");

      let userId = localStorage.getItem("userId");
      if (!userId) {
        userId = Math.random().toString(36).substr(2, 9);
        localStorage.setItem("userId", userId);
      }

      const seed = userId
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const today = DateTime.now().setZone("America/Toronto").toISODate();
      const dailyIndex = (seed + new Date(today).getDate()) % data.length;

      const { q, a } = data[dailyIndex];
      localStorage.setItem(
        "quoteOfTheDay",
        JSON.stringify({ q, a, date: today }),
      );
      setQuote(q);
      setAuthor(a);
    } catch (err) {
      console.error("Failed to fetch", err);
      setQuote("Stay consistent and never give up!");
      setAuthor("Unknown");
    }
  };

  useEffect(() => {
    const today = DateTime.now().setZone("America/Toronto").toISODate();
    const savedQuote = localStorage.getItem("quoteOfTheDay");

    if (savedQuote) {
      const { q, a, date } = JSON.parse(savedQuote);
      if (date === today) {
        setQuote(q);
        setAuthor(a);
        return;
      }
    }
    fetchQuote();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full rounded-2xl p-6 md:p-8 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #C89FBB22 0%, #93B5A022 100%)",
        border: "1px solid rgba(200,159,187,0.25)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
      }}
    >
      {/* Decorative quote mark */}

      <div className="flex flex-col gap-3 relative z-10 items-center text-center">
        <p className="text-xs uppercase tracking-widest font-bold text-accent-pink">
          Quote of the Day
        </p>
        <p className="text-lg md:text-xl text-text italic font-semibold leading-relaxed max-w-2xl">
          "{quote}"
        </p>
        <p className="text-sm text-sub-text">— {author}</p>
      </div>
    </motion.div>
  );
};

export default QuoteCard;
