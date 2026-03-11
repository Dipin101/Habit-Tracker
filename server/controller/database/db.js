const mongoose = require("mongoose");

const connectDB = async () => {
  let mongoURI;
  let dbName = process.env.DB_NAME || "oneapp";

  try {
    if (process.env.NODE_ENV === "production" && process.env.MONGO_URI) {
      mongoURI = process.env.MONGO_URI;
    } else {
      mongoURI = "mongodb://localhost:27017/oneapp";
    }

    console.log("Connecting to MongoDB:", mongoURI);

    await mongoose.connect(mongoURI, {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message,
      "\nFalling back to local MongoDB...",
    );

    if (!mongoURI.includes("localhost")) {
      try {
        await mongoose.connect("mongodb://localhost:27017/oneapp", {
          dbName,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log("Fallback to local MongoDB successful");
      } catch (err) {
        console.error("Local fallback failed:", err.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
