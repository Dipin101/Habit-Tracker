const mongoose = require("mongoose");

const HabitDaySchema = new mongoose.Schema({
  month: String,
  year: Number,
  day: Number,
  summary: { type: String, maxlength: 100, default: "" }, // For Memorable/Journal
  journal: { type: String, default: "" },
});

const CommentSchema = new mongoose.Schema({
  date: { type: String, required: true },
  text: { type: String, default: "" },
});

const HabitDayStatusSchema = new mongoose.Schema({
  date: { type: String, required: true },
  status: {
    type: String,
    enum: ["completed", "in progress", "not completed"],
    default: "in progress",
  },
});

const HabitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: [HabitDayStatusSchema],
  comment: [CommentSchema],
});

const SleepDaySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  hours: { type: Number, default: 0 },
});

const MoodSchema = new mongoose.Schema({
  date: { type: String, required: true },
  rating: { type: Number, min: 1, max: 10, required: true },
  createdAt: { type: Date, default: Date.now },
});

const MonthDataSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: String, required: true },
  trackSleep: { type: Boolean, default: false },
  sleepTrackingStart: { type: Date, default: null },
  memorable: [HabitDaySchema],
  habits: [HabitSchema],
  sleep: [SleepDaySchema],
  mood: [MoodSchema],
});

const HabitsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  months: [MonthDataSchema], // all months stored in this array
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Habits", HabitsSchema);
