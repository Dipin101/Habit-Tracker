import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import { Link } from "react-router-dom";
import { motion, stagger } from "framer-motion";
import heroImage from "../assets/image/hero_section.svg";
import StickyFeature from "../components/StickyFeature.jsx";
import ZoomBridge from "../components/ZoomBridge.jsx";

const Homepage = () => {
  const [imageSettled, setImageSettled] = useState(false);
  const [textDone, setTextDone] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const letterVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  const textVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };
  return (
    <div className="bg-background">
      <Navbar />

      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-12 overflow-hidden">
        <div
          className="absolute top-20 -left-6 md:-left-20 w-40 md:w-72 h-40 md:h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "#C89FBB" }}
        />
        <div
          className="absolute bottom-10 -right-6 md:-right-20 w-56 md:w-96 h-56 md:h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "#93B5A0" }}
        />

        <div className="flex flex-col md:flex-row w-full justify-between max-w-6xl mx-auto gap-6 md:gap-10 lg:gap-16 items-center">
          <motion.div
            className="flex flex-col items-center gap-8 w-full md:w-[55%] lg:w-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={imageSettled ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={() => imageSettled && setTextDone(true)}
          >
            <div className="flex flex-col items-center gap-5 w-full text-center">
              <motion.h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-text"
                variants={textVariants}
                initial="hidden"
                animate={imageSettled ? "visible" : "hidden"}
              >
                {"UNLOCK YOUR BEST ".split("").map((char, i) => (
                  <motion.span key={i} variants={letterVariants}>
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
                <span className="text-accent-pink">
                  {"SELF".split("").map((char, i) => (
                    <motion.span key={i} variants={letterVariants}>
                      {char}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>

              <motion.p
                className="text-base md:text-lg lg:text-xl text-sub-text"
                variants={textVariants}
                initial="hidden"
                animate={imageSettled ? "visible" : "hidden"}
              >
                {"Track you daily habits and achieve your goals with Habit Tracker, the simple and intuitive habit tracking app."
                  .split("")
                  .map((char, i) => (
                    <motion.span key={i} variants={letterVariants}>
                      {char}
                    </motion.span>
                  ))}
              </motion.p>
            </div>

            <div className="flex flex-col gap-4 items-center justify-center md:flex-row">
              <Link to="/signup">
                <motion.button
                  className="px-6 py-4 rounded-full text-white uppercase font-bold text-sm tracking-wide"
                  style={{
                    background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
                    boxShadow: "0 8px 24px rgba(200,159,187,0.35)",
                  }}
                  initial={{ opacity: 0, rotate: -180, scale: 0 }}
                  animate={textDone ? { scale: 1, rotate: 0, opacity: 1 } : {}}
                  transition={{ duration: 1, ease: "backOut" }}
                  whileHover={{ scale: 1.1 }}
                >
                  Start Tracking
                </motion.button>
              </Link>

              <Link to="/#">
                <motion.button
                  className="px-6 py-4 rounded-full bg-transparent text-sm font-medium"
                  style={{
                    border: "2px solid #93B5A0",
                    color: "#5a7a8f",
                  }}
                  initial={{ opacity: 0, rotate: -180, scale: 0 }}
                  animate={textDone ? { scale: 1, rotate: 0, opacity: 1 } : {}}
                  transition={{ duration: 1, ease: "backOut" }}
                  whileHover={{ scale: 1.1 }}
                >
                  View Demo
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <motion.img
            className="hidden md:block md:max-w-[280px] lg:max-w-md xl:max-w-lg h-auto"
            src={heroImage}
            alt="hero section image"
            initial={{ opacity: 0, scale: 2 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: imageSettled ? [0, -10, 0] : 0,
            }}
            transition={
              imageSettled
                ? { y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }
                : { duration: 1.2, ease: "easeOut" }
            }
            onAnimationComplete={() => setImageSettled(true)}
          />
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={textDone ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <span className="text-xs uppercase tracking-widest text-sub-text">
            Scroll
          </span>
          <motion.div
            className="w-0.5 h-8 bg-accent-green"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </section>

      <div style={{ position: "relative", zIndex: 1 }} />
      <ZoomBridge />
      <div style={{ position: "relative", zIndex: 20, marginTop: "-5dvh" }}>
        <StickyFeature />
      </div>
      <div
        style={{
          background:
            "linear-gradient(to bottom, #0a0a0a 0%, #0d1a1f 25%, #1e3a4a 60%, #ebf5fa 100%)",
          height: "400px",
        }}
      />

      <section
        id="about"
        className="bg-background px-6 md:px-16 lg:px-24 py-24"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex flex-col gap-3 md:w-1/3">
            <p
              className="text-xs uppercase tracking-[0.3em] font-medium"
              style={{ color: "#93B5A0" }}
            >
              The person behind it
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{ color: "#0d2233" }}
            >
              Hi, I'm <span style={{ color: "#C89FBB" }}>Dipin.</span>
            </h2>
            <p
              className="text-sm uppercase tracking-widest"
              style={{ color: "#5a7a8f" }}
            >
              Aspiring Fullstack Developer
            </p>
          </div>

          <div
            className="md:w-2/3 flex flex-col gap-6 px-8 py-10 rounded-3xl"
            style={{
              background: "#ddeef7",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="w-10 h-1 rounded-full"
              style={{ background: "#C89FBB" }}
            />

            <p
              className="text-base md:text-lg leading-relaxed"
              style={{ color: "#0d2233" }}
            >
              I built Habit Tracker because I needed it myself. I kept starting
              habits — gym, reading, better sleep — and losing track after a
              week. No app felt simple enough to actually stick with.
            </p>
            <p
              className="text-base md:text-lg leading-relaxed"
              style={{ color: "#0d2233" }}
            >
              So I built one. Clean, fast, and focused on one thing —{" "}
              <span className="font-semibold" style={{ color: "#C89FBB" }}>
                helping you show up every day.
              </span>{" "}
              This is as much my tool as it is yours.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#5a7a8f" }}>
              Always improving it. If you have feedback, ideas, or just want to
              say hi — I'd love to hear from you.
            </p>

            <div className="flex gap-4 flex-wrap pt-2">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-3 rounded-full text-sm font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
                  }}
                >
                  Start Tracking
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="bg-background border-t px-6 md:px-16 py-12"
        style={{ borderColor: "rgba(0,0,0,0.08)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div className="flex flex-col gap-3 max-w-xs">
            <h3 className="font-bold text-lg" style={{ color: "#0d2233" }}>
              Habit Tracker
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#5a7a8f" }}>
              Small actions, taken daily, compound into real results.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "#5a7a8f" }}
            >
              Navigate
            </p>
            <Link
              to="/"
              className="text-sm hover:opacity-70 transition-opacity"
              style={{ color: "#0d2233" }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Home
            </Link>
            <Link
              to="/signup"
              className="text-sm hover:opacity-70 transition-opacity"
              style={{ color: "#0d2233" }}
            >
              Get Started
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "#5a7a8f" }}
            >
              Built by
            </p>
            <p className="text-sm font-medium" style={{ color: "#0d2233" }}>
              Dipin Khatri
            </p>
            <p
              className="text-xs leading-relaxed max-w-[200px]"
              style={{ color: "#5a7a8f" }}
            >
              Aspiring fullstack developer building tools for real life.
            </p>

            <a
              href="https://github.com/Dipin101"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:opacity-70 transition-opacity text-accent-pink"
            >
              Find me on GitHub →
            </a>
          </div>
        </div>

        <div
          className="max-w-6xl mx-auto mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          <p className="text-xs" style={{ color: "#5a7a8f" }}>
            © 2025 Habit Tracker. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "#5a7a8f" }}>
            Made with by Dipin Khatri
          </p>
        </div>
      </footer>

      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(135deg, #C89FBB, #a87d9a)" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ opacity: showScrollTop ? 1 : 0, y: showScrollTop ? 0 : 20 }}
        transition={{ duration: 0.3 }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 13L8 3M8 3L4 7M8 3L12 7"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>
    </div>
  );
};

export default Homepage;
