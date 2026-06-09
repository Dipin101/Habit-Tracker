const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./controller/database/db");
const userRoutes = require("./routes/users");

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();
app.use(
  cors({
    origin: [
      "https://habit-tracker-three-ivory.vercel.app",
      "http://localhost:5173",
      "http://localhost:4000",
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use((req, res, next) => {
  console.log("HIT:", req.method, req.path);
  next();
});

app.use("/api/users", userRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
