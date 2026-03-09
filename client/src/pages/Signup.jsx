import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { fetchFromBackend } from "../api";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const uid = userCredential.user.uid;
      const res = await fetchFromBackend("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          firebaseUid: uid,
        }),
      });
      console.log("Registration successful:", res.message || res);
      navigate("/signin");
    } catch (errors) {
      console.log("Server Error: ", errors);
    }
  };

  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const res = await fetchFromBackend("/api/users/googleauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      console.log("Google Signin working", res);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login failed:", error.message || error);
      alert(error.message || "Google login failed");
    }
  };

  // rgba values stay as style — Tailwind can't handle opacity variants cleanly
  const inputStyle = {
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.08)",
  };

  const focusStyle = (e) =>
    (e.target.style.borderColor = "rgba(147,181,160,0.6)");
  const blurStyle = (e) => (e.target.style.borderColor = "rgba(0,0,0,0.08)");

  const InputField = ({ label, error, children }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-widest font-medium text-sub-text">
        {label}
      </label>
      {children}
      <span className="text-xs min-h-[1rem] text-error">{error || ""}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Background glows — rgba stays as style */}
      <div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgba(244,162,97,0.15)", filter: "blur(80px)" }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgba(200,159,187,0.12)", filter: "blur(80px)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative w-full max-w-lg flex flex-col gap-6 px-8 py-10 md:px-12 md:py-12 rounded-3xl bg-card"
        style={{
          boxShadow:
            "0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        {/* Top glow */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-16 rounded-full pointer-events-none"
          style={{ background: "rgba(200,159,187,0.2)", filter: "blur(40px)" }}
        />

        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-[0.25em] text-sub-text"
            style={{
              background: "rgba(147,181,160,0.15)",
              border: "1px solid rgba(147,181,160,0.3)",
            }}
          >
            Get started
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-text">
            Create Account
          </h1>
          <p className="text-sm text-sub-text">
            Start tracking your habits today
          </p>
        </div>

        {/* Divider */}
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* First + Last name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              error={errors.firstName ? "Required" : ""}
            >
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-text"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
                {...register("firstName", { required: true })}
              />
            </InputField>
            <InputField
              label="Last Name"
              error={errors.lastName ? "Required" : ""}
            >
              <input
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-text"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
                {...register("lastName", { required: true })}
              />
            </InputField>
          </div>

          {/* Email */}
          <InputField label="Email" error={errors.email?.message}>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-text"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value:
                    /^[\w.-]+@(gmail|yahoo|hotmail|outlook|rocketmail)\.com$/,
                  message: "Invalid email format",
                },
              })}
            />
          </InputField>

          {/* Phone */}
          <InputField label="Phone" error={errors.phone?.message}>
            <input
              type="text"
              placeholder="10-digit number"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-text"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
              maxLength={10}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
              }}
              {...register("phone", {
                required: "Phone is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Must be exactly 10 digits",
                },
              })}
            />
          </InputField>

          {/* Password */}
          <InputField label="Password" error={errors.password?.message}>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-12 text-text"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  transition: "opacity 0.4s ease",
                  opacity: showPassword ? 1 : 0.7,
                }}
                onFocus={focusStyle}
                onBlur={blurStyle}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 7, message: "Minimum 7 characters" },
                  maxLength: { value: 100, message: "Too long" },
                })}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 text-sub-text"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <AnimatePresence mode="wait">
                  {showPassword ? (
                    <motion.span
                      key="hide"
                      initial={{ opacity: 0, rotate: -15 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 15 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      style={{ display: "block" }}
                    >
                      <AiFillEyeInvisible size={20} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="show"
                      initial={{ opacity: 0, rotate: 15 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -15 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      style={{ display: "block" }}
                    >
                      <AiFillEye size={20} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </InputField>

          {/* Buttons */}
          <div className="flex flex-col gap-3 mt-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
              }}
            >
              Create Account
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={googleLogin}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-text"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-3-11.3-7.3l-6.5 5C9.8 39.7 16.4 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.9 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"
                />
              </svg>
              Continue with Google
            </motion.button>
          </div>
        </form>

        {/* Signin redirect */}
        <p className="text-center text-xs text-sub-text">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-medium hover:opacity-70 transition-opacity text-accent-pink"
          >
            Sign in
          </Link>
        </p>

        {/* Back to home */}
        <Link
          to="/"
          className="text-center text-xs hover:opacity-70 transition-opacity text-sub-text"
        >
          ← Back to home
        </Link>
      </motion.div>
    </div>
  );
};

export default Signup;
