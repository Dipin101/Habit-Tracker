import React from "react";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { fetchFromBackend } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [editField, setEditField] = useState(null); // which field is being edited
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

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

  const openEdit = (field, currentValue) => {
    setEditField(field);
    // pre-fill the form with current value
    reset({ [field]: currentValue || "" });
  };

  const closeModal = () => {
    setEditField(null);
    reset();
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      const res = await fetchFromBackend("/api/users/updateProfile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          // only send the field being edited
          [editField]: data[editField],
        }),
      });
      // update local state so UI reflects change immediately
      setUserData((prev) => ({ ...prev, [editField]: data[editField] }));
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
      closeModal();
    } catch (e) {
      console.error("Failed to update:", e);
    } finally {
      setSaving(false);
    }
  };

  const initials =
    `${userData.firstName?.[0] || ""}${userData.lastName?.[0] || ""}`.toUpperCase();

  const fields = [
    { label: "First Name", key: "firstName", value: userData.firstName },
    { label: "Last Name", key: "lastName", value: userData.lastName },
    { label: "Email", key: "email", value: userData.email, disabled: true }, // email shouldn't be editable easily
    { label: "Phone", key: "phone", value: userData.phone },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Background blobs */}
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

        {/* Avatar + name */}
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

          {/* Saved confirmation */}
          <AnimatePresence>
            {savedMsg && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium text-accent-green"
              >
                Profile updated ✓
              </motion.span>
            )}
          </AnimatePresence>
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

        {/* Fields */}
        <div className="flex flex-col gap-3">
          {fields.map(({ label, key, value, disabled }, i) => (
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
              {!disabled && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openEdit(key, value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
                  }}
                >
                  Edit
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {editField && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              style={{
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />

            {/* Modal box */}
            <motion.div
              className="fixed z-50 w-full max-w-sm mx-auto left-0 right-0 top-1/2 -translate-y-1/2 px-4"
              initial={{ opacity: 0, scale: 0.9, y: "-40%" }}
              animate={{ opacity: 1, scale: 1, y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, y: "-40%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div
                className="flex flex-col gap-5 px-8 py-8 rounded-3xl bg-card"
                style={{
                  boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
                  border: "1px solid rgba(255,255,255,0.6)",
                }}
              >
                {/* Modal header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-text capitalize">
                    Edit {editField.replace(/([A-Z])/g, " $1")}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-sub-text hover:text-text transition-colors text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-widest font-medium text-sub-text">
                      {editField.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      {...register(editField, {
                        required: "This field is required",
                      })}
                      className="w-full px-4 py-3 rounded-xl text-sm text-text outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.8)",
                        border: errors[editField]
                          ? "1px solid #e07070"
                          : "1px solid rgba(0,0,0,0.1)",
                      }}
                      placeholder={`Enter ${editField.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                      autoFocus
                    />
                    {errors[editField] && (
                      <span className="text-xs" style={{ color: "#e07070" }}>
                        {errors[editField].message}
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 py-3 rounded-xl text-sm font-medium text-sub-text transition-opacity hover:opacity-70"
                      style={{
                        background: "rgba(0,0,0,0.05)",
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                      style={{
                        background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
