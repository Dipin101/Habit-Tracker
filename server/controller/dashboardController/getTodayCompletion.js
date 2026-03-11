const { DateTime } = require("luxon");
const Habits = require("../../models/Habits");

const getTodayCompletion = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = DateTime.now().setZone("America/Toronto");
    const month = String(today.month).padStart(2, "0");
    const year = today.year;

    const habitsDoc = await Habits.findOne({ userId });
    if (!habitsDoc) return res.status(404).json({ message: "No habits found" });

    const monthData = habitsDoc.months.find(
      (m) => m.year === year && m.month === month,
    );
    if (!monthData || !monthData.habits) return res.json({ habits: [] });

    const todayHabits = monthData.habits.map((habit) => {
      const todayStatusObj = habit.status.find(
        (s) => s.date === today.toISODate(),
      );
      return {
        _id: habit._id,
        name: habit.title,
        status: todayStatusObj ? todayStatusObj.status : "in progress",
      };
    });
    res.json({ habits: todayHabits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch today's habits" });
  }
};

module.exports = getTodayCompletion;
