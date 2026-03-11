import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "./Loading";
import { GoHomeFill, GoChecklist } from "react-icons/go";
import { CgProfile } from "react-icons/cg";
import { RiLogoutBoxLine } from "react-icons/ri";
import { IoAnalyticsSharp } from "react-icons/io5";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", Icon: GoHomeFill, end: true },
  { to: "/dashboard/profile", label: "Profile", Icon: CgProfile, end: true },
  {
    to: "/dashboard/habittrack",
    label: "Habit Tracker",
    Icon: GoChecklist,
    end: true,
  },
  {
    to: "/dashboard/analytics",
    label: "Analytics",
    Icon: IoAnalyticsSharp,
    end: false,
  },
];

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/signin");
  };

  if (loading) return <Loading />;

  if (isDashboard && user) {
    return (
      <>
        {/* SIDEBAR — desktop only */}
        <motion.div
          animate={{ width: sidebarOpen ? 240 : 68 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="hidden md:flex fixed top-0 left-0 h-screen flex-col z-50 overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #C89FBB 0%, #a87d9a 100%)",
            borderRight: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {/* Collapsed */}
          {!sidebarOpen && (
            <div className="flex flex-col items-center py-6 gap-4 h-full">
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
              >
                <AiOutlineMenu size={18} />
              </button>
              <div
                className="w-6 h-px"
                style={{ background: "rgba(255,255,255,0.2)" }}
              />
              <div className="flex flex-col items-center gap-2 flex-1">
                {NAV_LINKS.map(({ to, label, Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "text-white/60 hover:text-white hover:bg-white/15"
                      }`
                    }
                    style={({ isActive }) =>
                      isActive ? { background: "rgba(255,255,255,0.2)" } : {}
                    }
                  >
                    <Icon size={18} />
                  </NavLink>
                ))}
              </div>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all mb-4 text-white"
                style={{ background: "rgba(220,38,38,0.35)" }}
              >
                <RiLogoutBoxLine size={18} />
              </motion.button>
            </div>
          )}

          {/* Expanded */}
          {sidebarOpen && (
            <div className="flex flex-col p-4 h-full">
              <div className="flex items-center justify-between mb-8 h-8">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-base font-bold text-white tracking-widest uppercase whitespace-nowrap"
                >
                  OneApp
                </motion.span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <AiOutlineClose size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                {NAV_LINKS.map(({ to, label, Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        isActive
                          ? "text-white font-semibold"
                          : "text-white/60 hover:text-white"
                      }`
                    }
                    style={({ isActive }) =>
                      isActive ? { background: "rgba(255,255,255,0.2)" } : {}
                    }
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  </NavLink>
                ))}
              </div>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: "rgba(220,38,38,0.4)" }}
              >
                <RiLogoutBoxLine size={18} />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap"
                >
                  Logout
                </motion.span>
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* BOTTOM TAB BAR — mobile only */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-4 py-2"
          style={{
            background: "linear-gradient(160deg, #C89FBB 0%, #a87d9a 100%)",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {NAV_LINKS.map(({ to, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? "bg-white/25 text-white" : "text-white/60"
                }`
              }
            >
              <Icon size={22} />
            </NavLink>
          ))}
          <motion.button
            onClick={handleLogout}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
            style={{ background: "rgba(220,38,38,0.35)" }}
          >
            <RiLogoutBoxLine size={22} />
          </motion.button>
        </div>
      </>
    );
  }

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div
          className="flex items-center justify-between w-full max-w-4xl px-5 py-3 rounded-2xl transition-all duration-300"
          style={{
            background: scrolled
              ? "rgba(235,245,250,0.92)"
              : "rgba(235,245,250,0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0,0,0,0.08)"
              : "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-base font-bold uppercase tracking-widest text-text"
          >
            OneApp
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "Features", href: "#features" },
              { label: "About Me", href: "#about" },
            ].map(({ label, href }) => (
              <button
                key={label}
                onClick={() => {
                  const section = document.querySelector(href);
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm font-medium text-sub-text hover:text-text transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <NavLink
              to="/signin"
              className="text-sm font-medium px-4 py-2 rounded-xl text-sub-text hover:text-text transition-colors"
            >
              Sign In
            </NavLink>
            <NavLink to="/signup">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
                style={{
                  background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
                }}
              >
                Get Started
              </motion.button>
            </NavLink>
          </div>
          <button
            className="md:hidden text-text"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <AiOutlineClose size={22} /> : <AiOutlineMenu size={22} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-4 right-4 z-40 flex flex-col gap-2 p-4 rounded-2xl"
            style={{
              background: "rgba(235,245,250,0.97)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            {[
              { label: "Features", href: "#features" },
              { label: "About", href: "#about" },
            ].map(({ label, href }) => (
              <button
                key={label}
                onClick={() => {
                  setOpen(false);
                  const section = document.querySelector(href);
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm font-medium text-left px-4 py-3 rounded-xl text-sub-text hover:text-text transition-colors"
                style={{ background: "rgba(0,0,0,0.03)" }}
              >
                {label}
              </button>
            ))}
            <div
              className="flex flex-col gap-2 pt-2 mt-1 border-t"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <NavLink
                to="/signin"
                onClick={() => setOpen(false)}
                className="text-sm font-medium px-4 py-3 rounded-xl text-center text-sub-text"
                style={{ background: "rgba(0,0,0,0.03)" }}
              >
                Sign In
              </NavLink>
              <NavLink to="/signup" onClick={() => setOpen(false)}>
                <button
                  className="w-full text-sm font-semibold px-4 py-3 rounded-xl text-white"
                  style={{
                    background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
                  }}
                >
                  Get Started
                </button>
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
