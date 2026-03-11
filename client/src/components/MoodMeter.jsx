import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchFromBackend } from "../api";
import { motion } from "framer-motion";

const MOODS = [
  { rating: 1, emoji: "😣", label: "Awful" },
  { rating: 2, emoji: "😞", label: "Bad" },
  { rating: 3, emoji: "😟", label: "Poor" },
  { rating: 4, emoji: "😕", label: "Meh" },
  { rating: 5, emoji: "😐", label: "Okay" },
  { rating: 6, emoji: "🙂", label: "Fine" },
  { rating: 7, emoji: "😊", label: "Good" },
  { rating: 8, emoji: "😄", label: "Great" },
  { rating: 9, emoji: "😁", label: "Amazing" },
  { rating: 10, emoji: "🤩", label: "Perfect" },
];

// color goes from red → orange → green
const getMoodColor = (rating) => {
  if (rating <= 3) return "#e07070";
  if (rating <= 5) return "#F4A261";
  if (rating <= 7) return "#f4c261";
  return "#93B5A0";
};

const MoodMeter = () => {
  const [rating, setRating] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUserId(user.uid);
      const res = await fetchFromBackend("/api/users/mood-today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid }),
      });
      if (res.rating) {
        setRating(res.rating);
        setSaved(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSelect = async (r) => {
    setRating(r);
    setSaved(false);
    await fetchFromBackend("/api/users/mood-save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebaseUid: userId, rating: r }),
    });
    setSaved(true);
  };

  const display = hovered || rating;
  const mood = MOODS.find((m) => m.rating === display);

  // speedometer arc math
  const size = 160;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = 60;
  const startAngle = -200;
  const endAngle = 20;
  const totalAngle = endAngle - startAngle;

  const polarToCartesian = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const arcPath = (start, end) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const needleAngle = display
    ? startAngle + ((display - 1) / 9) * totalAngle
    : startAngle;

  const needleTip = polarToCartesian(needleAngle);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-sub-text font-medium">
          How are you feeling?
        </p>
        {saved && rating && (
          <span className="text-xs text-accent-green font-medium">Saved ✓</span>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        {/* Speedometer SVG */}
        <svg
          width={size}
          height={size * 0.75}
          viewBox={`0 0 ${size} ${size * 0.75}`}
        >
          {/* Background arc */}
          <path
            d={arcPath(startAngle, endAngle)}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          {display && (
            <motion.path
              d={arcPath(startAngle, needleAngle)}
              fill="none"
              stroke={getMoodColor(display)}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}
          {/* Needle */}
          {display && (
            <motion.line
              x1={cx}
              y1={cy}
              x2={needleTip.x}
              y2={needleTip.y}
              stroke={getMoodColor(display)}
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
          {/* Center dot */}
          <circle
            cx={cx}
            cy={cy}
            r="4"
            fill={display ? getMoodColor(display) : "rgba(0,0,0,0.1)"}
          />

          {/* Emoji + label in center */}
          {mood && (
            <>
              <text x={cx} y={cy - 18} textAnchor="middle" fontSize="20">
                {mood.emoji}
              </text>
              <text
                x={cx}
                y={cy + 16}
                textAnchor="middle"
                fontSize="9"
                fill={getMoodColor(display)}
                fontWeight="600"
              >
                {mood.label}
              </text>
            </>
          )}
        </svg>

        {/* Rating buttons */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          {MOODS.map((m) => (
            <motion.button
              key={m.rating}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSelect(m.rating)}
              onMouseEnter={() => setHovered(m.rating)}
              onMouseLeave={() => setHovered(null)}
              className="text-lg leading-none"
              style={{
                opacity: rating && rating !== m.rating && !hovered ? 0.4 : 1,
                filter:
                  rating === m.rating
                    ? "drop-shadow(0 0 4px rgba(0,0,0,0.2))"
                    : "none",
                transition: "opacity 0.2s",
              }}
              title={`${m.rating} — ${m.label}`}
            >
              {m.emoji}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodMeter;
