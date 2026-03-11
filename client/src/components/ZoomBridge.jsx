import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import brainImage from "../assets/image/mind.svg";

const getHabitCards = () => {
  const s = window.innerWidth < 768 ? 0.45 : 1;
  return [
    {
      emoji: "🏃",
      label: "Exercise",
      rotate: -12,
      startX: -600 * s,
      startY: -400 * s,
      endX: -220 * s,
      endY: -140 * s,
    },
    {
      emoji: "😴",
      label: "Sleep 8hrs",
      rotate: 8,
      startX: 600 * s,
      startY: -400 * s,
      endX: 170 * s,
      endY: -150 * s,
    },
    {
      emoji: "📚",
      label: "Read",
      rotate: -6,
      startX: -700 * s,
      startY: -50 * s,
      endX: -240 * s,
      endY: 10,
    },
    {
      emoji: "💧",
      label: "Drink Water",
      rotate: 14,
      startX: 700 * s,
      startY: -50 * s,
      endX: 160 * s,
      endY: 10,
    },
    {
      emoji: "🧘",
      label: "Meditate",
      rotate: -9,
      startX: -600 * s,
      startY: 400 * s,
      endX: -200 * s,
      endY: 150 * s,
    },
    {
      emoji: "🥗",
      label: "Eat Clean",
      rotate: 6,
      startX: 600 * s,
      startY: 400 * s,
      endX: 155 * s,
      endY: 155 * s,
    },
  ];
};

const HabitCard = ({ card, scrollYProgress }) => {
  const x = useTransform(
    scrollYProgress,
    [0.2, 0.55],
    [card.startX, card.endX],
  );
  const y = useTransform(
    scrollYProgress,
    [0.2, 0.55],
    [card.startY, card.endY],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0.12, 0.18, 0.65, 0.78],
    [0, 1, 1, 0],
  );
  const scale = useTransform(scrollYProgress, [0.2, 0.55], [0.3, 1]);

  return (
    <motion.div
      style={{
        x,
        y,
        opacity,
        scale,
        rotate: card.rotate,
        position: "absolute",
        top: "50%",
        left: "50%",
        zIndex: 2,
      }}
      className="bg-white shadow-xl rounded-xl px-3 py-2 md:px-4 md:py-2.5 flex gap-2 items-center text-gray-800 text-xs md:text-sm font-medium"
    >
      <span className="text-base md:text-xl">{card.emoji}</span>
      <span>{card.label}</span>
    </motion.div>
  );
};

const ZoomBridge = () => {
  const ref = useRef(null);
  const [habitCards, setHabitCards] = useState(getHabitCards);

  useEffect(() => {
    const handleResize = () => setHabitCards(getHabitCards());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = useRef(window.innerWidth < 768).current;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: isMobile ? ["start start", "end end"] : ["start end", "end end"],
  });

  const brainOpacity = useTransform(
    scrollYProgress,
    isMobile ? [0, 0.05, 0.82, 0.92] : [0, 0.08, 0.82, 0.92],
    [0, 1, 1, 0],
  );
  const brainScale = useTransform(
    scrollYProgress,
    isMobile ? [0, 0.15] : [0, 0.2],
    [0.8, 1.4],
    { clamp: true },
  );
  const clarityOpacity = useTransform(
    scrollYProgress,
    [0.82, 0.87, 0.95, 0.99],
    [0, 1, 1, 0],
  );
  const clarityY = useTransform(scrollYProgress, [0.85, 0.95], [30, 0]);
  const glowOpacity = useTransform(
    scrollYProgress,
    [0.45, 0.6, 0.75, 0.85],
    [0, 1, 1, 0],
  );
  const cardScale = useTransform(scrollYProgress, [0.95, 1], [1, 8]);
  const overlayOpacity = useTransform(scrollYProgress, [0.98, 1], [0, 1]);

  return (
    <section ref={ref} className="relative h-[600vh] bg-background">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          style={{
            opacity: glowOpacity,
            position: "absolute",
            top: "50%",
            left: "50%",
            x: "-50%",
            y: "-50%",
            width: "min(900px, 100vw)",
            height: "min(900px, 100vw)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(239,68,68,0.5) 0%, rgba(239,68,68,0.5) 50%, transparent 70%)",
            filter: "blur(10px)",
            zIndex: 0,
          }}
        />

        <motion.div
          style={{
            opacity: brainOpacity,
            scale: brainScale,
            position: "absolute",
            top: "50%",
            left: "50%",
            x: "-50%",
            y: "-50%",
            zIndex: 1,
          }}
        >
          <img
            src={brainImage}
            alt="brain"
            className="w-48 md:w-90 lg:w-106 select-none block"
          />
        </motion.div>

        {habitCards.map((card, i) => (
          <HabitCard key={i} card={card} scrollYProgress={scrollYProgress} />
        ))}

        <motion.div
          style={{
            opacity: clarityOpacity,
            y: clarityY,
            zIndex: 10,
            scale: cardScale,
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 md:px-8"
        >
          <div
            className="relative flex flex-col items-center gap-4 md:gap-7 px-6 py-10 md:px-16 md:py-16 rounded-2xl md:rounded-3xl text-center w-full"
            style={{
              maxWidth: "860px",
              background:
                "linear-gradient(160deg, rgba(30,15,25,0.95) 0%, rgba(20,30,25,0.95) 100%)",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(40px)",
            }}
          >
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-24 rounded-full pointer-events-none"
              style={{
                background: "rgba(200,159,187,0.2)",
                filter: "blur(50px)",
              }}
            />

            <span
              className="px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs font-medium uppercase tracking-[0.25em]"
              style={{
                background: "rgba(147,181,160,0.12)",
                color: "#93B5A0",
                border: "1px solid rgba(147,181,160,0.3)",
              }}
            >
              Start your journey
            </span>

            <div className="flex flex-col gap-2 md:gap-3">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight text-white uppercase">
                Habit Tracker
              </h1>
              <p
                className="text-xs md:text-sm uppercase tracking-[0.4em] font-medium"
                style={{ color: "#93B5A0" }}
              >
                Build better · Live stronger
              </p>
            </div>

            <div className="flex items-center gap-3 w-full px-2 md:px-4">
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#93B5A0" }}
              />
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
            </div>

            <p
              className="text-sm md:text-lg lg:text-xl leading-relaxed max-w-2xl"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              The simplest way to build routines that last. Track your progress,
              stay consistent, and turn your goals into{" "}
              <span className="font-semibold" style={{ color: "#C89FBB" }}>
                daily victories.
              </span>
            </p>

            <motion.div
              className="flex flex-col items-center gap-2 mt-2"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <p
                className="text-xs uppercase tracking-widest whitespace-nowrap"
                style={{ color: "#93B5A0" }}
              >
                scroll to explore features
              </p>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 3L8 13M8 13L4 9M8 13L12 9"
                    stroke="#93B5A0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            </motion.div>

            <div
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 h-16 rounded-full pointer-events-none"
              style={{
                background: "rgba(147,181,160,0.12)",
                filter: "blur(40px)",
              }}
            />
          </div>
        </motion.div>

        <motion.div
          style={{
            opacity: overlayOpacity,
            position: "absolute",
            inset: 0,
            background: "#0a0a0a",
            zIndex: 11,
            pointerEvents: "none",
          }}
        />
      </div>
    </section>
  );
};

export default ZoomBridge;
