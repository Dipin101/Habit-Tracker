import React from "react";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { fetchFromBackend } from "../api";
import { motion } from "framer-motion";

const Profile = () => {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const idToken = await user.getIdToken();
      const res = await fetchFromBackend("/api/users/getProfile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      setUserData(res.userData);
    };
    fetchProfile();
  }, []);

  const initials =
    `${userData.firstName?.[0] || ""}${userData.lastName?.[0] || ""}`.toUpperCase();

  const fields = [
    { label: "First Name", value: userData.firstName },
    { label: "Last Name", value: userData.lastName },
    { label: "Email", value: userData.email },
    { label: "Phone", value: userData.phone },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgba(200,159,187,0.15)", filter: "blur(80px)" }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgba(147,181,160,0.1)", filter: "blur(80px)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative w-full max-w-md flex flex-col gap-6 px-8 py-10 md:px-12 md:py-12 rounded-3xl bg-card"
        style={{
          boxShadow:
            "0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-16 rounded-full pointer-events-none"
          style={{ background: "rgba(200,159,187,0.2)", filter: "blur(40px)" }}
        />

        <div className="flex flex-col items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #C89FBB, #a87d9a)" }}
          >
            {initials || "?"}
          </motion.div>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-lg font-bold text-text">
              {userData.firstName
                ? `${userData.firstName} ${userData.lastName}`
                : "Your Profile"}
            </h2>
            <span
              className="text-xs uppercase tracking-[0.25em] font-medium px-3 py-1 rounded-full text-sub-text"
              style={{
                background: "rgba(147,181,160,0.15)",
                border: "1px solid rgba(147,181,160,0.3)",
              }}
            >
              Member
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(0,0,0,0.06)" }}
          />
          <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(0,0,0,0.06)" }}
          />
        </div>

        <div className="flex flex-col gap-3">
          {fields.map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs uppercase tracking-widest font-medium text-sub-text">
                  {label}
                </span>
                <span className="text-sm font-medium text-text">
                  {value || "N/A"}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
                }}
              >
                Edit
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
