import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { fetchFromBackend } from "../api.js";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { sendPasswordResetEmail } from "firebase/auth";

const Signin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();
  const [resetMsg, setResetMsg] = useState("");
  const [resetError, setResetError] = useState("");

  const handleForgotPassword = async () => {
    const email = document.querySelector('input[type="email"]')?.value;
    if (!email) {
      setResetError("Enter your email first then click forgot password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMsg("Reset link sent! Check your email ✓");
      setTimeout(() => setResetMsg(""), 4000);
    } catch (err) {
      setResetError("Couldn't send reset email. Check your email is correct.");
      setTimeout(() => setResetError(""), 4000);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const uid = userCredential.user.uid;
      const res = await fetchFromBackend("/api/users/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: uid }),
      });
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setAuthError("Email or password did not match.");
      } else {
        setAuthError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(0,0,0,0.08)",
  };

  const focusStyle = (e) =>
    (e.target.style.borderColor = "rgba(147,181,160,0.6)");
  const blurStyle = (e) => (e.target.style.borderColor = "rgba(0,0,0,0.08)");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16 relative overflow-hidden">
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

        <div className="flex flex-col items-center gap-2 text-center">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-[0.25em] text-sub-text"
            style={{
              background: "rgba(147,181,160,0.15)",
              border: "1px solid rgba(147,181,160,0.3)",
            }}
          >
            Welcome back
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-text">
            Sign In
          </h1>
          <p className="text-sm text-sub-text">Continue your streak today</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest font-medium text-sub-text">
              Email
            </label>
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
            <span className="text-xs min-h-[1rem] text-error">
              {errors.email ? errors.email.message : ""}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest font-medium text-sub-text">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-12 text-text"
                style={{
                  ...inputStyle,
                  transition: "letter-spacing 0.3s ease, opacity 0.3s ease",
                  letterSpacing: showPassword ? "0.05em" : "0.2em",
                  opacity: showPassword ? 1 : 0.8,
                }}
                onFocus={focusStyle}
                onBlur={blurStyle}
                {...register("password", {
                  required: "The password is required",
                  minLength: {
                    value: 7,
                    message: "Minimum 7 characters needed",
                  },
                  maxLength: { value: 100, message: "Too long" },
                })}
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
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
                      transition={{ duration: 0.2 }}
                    >
                      <AiFillEyeInvisible size={20} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="show"
                      initial={{ opacity: 0, rotate: 15 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -15 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AiFillEye size={20} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
            <span className="text-xs min-h-[1rem] text-error">
              {errors.password ? errors.password.message : ""}
            </span>
          </div>

          {authError && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-center text-error"
            >
              {authError}
            </motion.p>
          )}
          <div className="flex flex-col items-end gap-1 -mt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs hover:opacity-70 transition-opacity text-accent-pink"
            >
              Forgot password?
            </button>

            <AnimatePresence>
              {resetMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-accent-green"
                >
                  {resetMsg}
                </motion.p>
              )}
              {resetError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-error"
                >
                  {resetError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-2 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #C89FBB, #a87d9a)",
              opacity: isLoading ? 0.8 : 1,
            }}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <p className="text-center text-xs text-sub-text">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium hover:opacity-70 transition-opacity text-accent-pink"
          >
            Sign up
          </Link>
        </p>

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

export default Signin;
