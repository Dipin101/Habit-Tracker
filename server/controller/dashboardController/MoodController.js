const { DateTime } = require("luxon");
const Habits = require("../../models/Habits");

const getTodayMood = async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    const today = DateTime.now().setZone("America/Toronto");
    const month = String(today.month).padStart(2, "0");
    const year = today.year;
    const dateStr = today.toISODate();

    const habitDoc = await Habits.findOne({ userId: firebaseUid });
    if (!habitDoc) return res.json({ rating: null });

    const monthData = habitDoc.months.find(
      (m) => m.month === month && m.year === year,
    );
    if (!monthData) return res.json({ rating: null });

    const todayMood = monthData.mood.find((m) => m.date === dateStr);
    res.json({ rating: todayMood ? todayMood.rating : null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const saveTodayMood = async (req, res) => {
  try {
    const { firebaseUid, rating } = req.body;
    const today = DateTime.now().setZone("America/Toronto");
    const month = String(today.month).padStart(2, "0");
    const year = today.year;
    const dateStr = today.toISODate();

    let habitDoc = await Habits.findOne({ userId: firebaseUid });

    if (!habitDoc) {
      habitDoc = new Habits({ userId: firebaseUid, months: [] });
    }

    let monthData = habitDoc.months.find(
      (m) => m.month === month && m.year === year,
    );

    if (!monthData) {
      habitDoc.months.push({ year, month, mood: [] });
      monthData = habitDoc.months[habitDoc.months.length - 1];
    }

    if (!monthData.mood) {
      monthData.mood = [];
    }

    const existing = monthData.mood.findIndex((m) => m.date === dateStr);
    if (existing >= 0) {
      monthData.mood[existing].rating = rating;
      monthData.mood[existing].createdAt = new Date();
    } else {
      monthData.mood.push({ date: dateStr, rating });
    }

    await habitDoc.save();
    res.json({ success: true, rating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getMoodForMonth = async (userId, year, month) => {
  const habitDoc = await Habits.findOne({ userId });
  if (!habitDoc) return [];

  const monthData = habitDoc.months.find(
    (m) => m.month === month && Number(m.year) === Number(year),
  );
  if (!monthData) return [];

  return monthData.mood ?? [];
};

module.exports = { getTodayMood, saveTodayMood, getMoodForMonth };
