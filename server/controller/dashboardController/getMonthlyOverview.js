const { DateTime } = require("luxon");
const Habits = require("../../models/Habits");

const getMonthlyOverview = async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    const now = DateTime.now().setZone("America/Toronto");
    const currentMonth = String(now.month).padStart(2, "0");
    const currentYear = now.year;

    const habitDoc = await Habits.findOne({ userId: firebaseUid });
    if (!habitDoc) return res.json({ totalHabits: 0, completionPercent: 0 });

    const monthData = habitDoc.months.find(
      (m) => m.month === currentMonth && m.year === currentYear,
    );

    if (!monthData) return res.json({ totalHabits: 0, completionPercent: 0 });

    const totalHabits = monthData.habits.length;

    let totalStatuses = 0;
    let completedStatuses = 0;

    monthData.habits.forEach((habit) => {
      habit.status.forEach((s) => {
        totalStatuses++;
        if (s.status === "completed") completedStatuses++;
      });
    });

    const completionPercent =
      totalStatuses > 0
        ? Math.round((completedStatuses / totalStatuses) * 100)
        : 0;

    res.json({ totalHabits, completionPercent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = getMonthlyOverview;
