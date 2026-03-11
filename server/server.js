// server.js
const dotenv = require("dotenv");
dotenv.config(); // <-- must be first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./controller/database/db");
const userRoutes = require("./routes/users");
// const session = require("express-session");
// const authRoutes = require("./routes/auth"); // Google auth routes

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();
app.use(
  cors({
    origin: [
      "https://habit-tracker-three-ivory.vercel.app", //for render
      "http://localhost:5173", //for local
    ],
    credentials: true, // allow cookies
  }),
);
app.use(express.json());

app.use((req, res, next) => {
  console.log("HIT:", req.method, req.path);
  next();
});
// your existing routes
app.use("/api/users", userRoutes);
// Connect to DB and only then start server
const startServer = async () => {
  try {
    await connectDB(); // wait until DB is connected
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
