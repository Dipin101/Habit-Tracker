import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { motion } from "framer-motion";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex bg-background">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <motion.main
        animate={{ marginLeft: isMobile ? 0 : sidebarOpen ? 240 : 68 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 min-h-screen p-4 md:p-6 pb-24 md:pb-6 min-w-0"
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
