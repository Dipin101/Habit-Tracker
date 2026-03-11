import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import journal from "../assets/image/journal.svg";
import habits from "../assets/image/organizer.svg";
import sleep from "../assets/image/sleep.svg";

const FEATURES = [
  {
    id: "journal",
    label: "01 — Journal",
    headline: "Everything,\norganized.",
    sub: "Tasks, goals, and projects in one fluid space. No friction, no chaos.",
    accent: "#0ea5a0",
    accentLight: "#cdf4f2",
    image: journal,
    bars: [90, 60, 80, 45, 70],
  },
  {
    id: "habits",
    label: "02 — Habits",
    headline: "Small wins\ncompound.",
    sub: "Log habits in seconds. Streaks build identity. Watch data reflect you.",
    accent: "#b45309",
    accentLight: "#fef3c7",
    image: habits,
    bars: [70, 72, 85, 90, 95],
  },
  {
    id: "sleep",
    label: "03 — Sleep",
    headline: "Rest is\npart of it.",
    sub: "Track sleep cycles, read your recovery score, wake up with intention.",
    accent: "#7c3aed",
    accentLight: "#ede9fe",
    image: sleep,
    bars: [50, 80, 65, 90, 55],
  },
];

const FeatureSlide = ({ feature, isActive }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute inset-0 flex items-center justify-center px-8 md:px-20 pointer-events-none"
    >
      <div className="flex flex-col md:flex-row items-center gap-16 max-w-5xl w-full">
        <div
          className="relative flex-shrink-0 w-56 h-96 rounded-[2.5rem] border flex flex-col items-center justify-center gap-6 overflow-hidden"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${feature.accent}33, #000)`,
            borderColor: `${feature.accent}33`,
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-25"
            style={{ background: feature.accent }}
          />

          <img
            src={feature.image}
            alt={feature.label}
            className="w-24 h-24 object-contain relative z-10 select-none"
          />

          <div className="flex flex-col gap-2 w-32 relative z-10">
            {feature.bars.map((w, i) => (
              <div
                key={i}
                className="h-2 rounded-full bg-white/10 overflow-hidden"
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: feature.accent }}
                  initial={{ width: 0 }}
                  animate={isActive ? { width: `${w}%` } : { width: 0 }}
                  transition={{
                    delay: i * 0.1 + 0.2,
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                />
              </div>
            ))}
          </div>

          <div
            className="absolute bottom-6 text-xs font-bold text-center py-1.5 px-4 rounded-full z-10"
            style={{ background: `${feature.accent}33`, color: feature.accent }}
          >
            {feature.label}
          </div>
        </div>

        <div className="flex flex-col gap-5 text-left max-w-md">
          <p
            className="text-xs font-black uppercase tracking-[0.3em]"
            style={{ color: feature.accent }}
          >
            {feature.label}
          </p>
          <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.1] whitespace-pre-line">
            {feature.headline}
          </h2>
          <p className="text-white/50 text-lg leading-relaxed">{feature.sub}</p>

          <div
            className="w-12 h-1 rounded-full"
            style={{ background: feature.accent }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const StickyFeature = () => {
  const ref = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const introOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      const idx = Math.min(
        Math.floor(v * FEATURES.length),
        FEATURES.length - 1,
      );
      setActiveIdx(idx);
    });
  }, [scrollYProgress]);

  const activeFeature = FEATURES[activeIdx];

  return (
    <section
      id="features"
      ref={ref}
      style={{ height: `${FEATURES.length * 100}vh` }}
      className="relative"
    >
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${activeFeature.accent}18 0%, #0a0a0a 60%)`,
        }}
      >
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.id}
            className="absolute inset-0"
            animate={{ opacity: i === activeIdx ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${feature.accent}18 0%, #0a0a0a 60%)`,
            }}
          />
        ))}

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: introOpacity, background: "#0a0a0a", zIndex: 30 }}
        />

        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.id}
              className="rounded-full"
              animate={{
                height: i === activeIdx ? 28 : 8,
                background:
                  i === activeIdx ? f.accent : "rgba(255,255,255,0.2)",
              }}
              style={{ width: 8 }}
            />
          ))}
        </div>

        {FEATURES.map((feature, i) => (
          <FeatureSlide
            key={feature.id}
            feature={feature}
            isActive={i === activeIdx}
          />
        ))}
      </div>
    </section>
  );
};

export default StickyFeature;
