const Habits = require("../../models/Habits");

const getMonthsSummary = async (req, res) => {
  try {
    const { userId, year } = req.params;
    const habitDoc = await Habits.findOne({ userId });
    if (!habitDoc) return res.json({ months: [] });

    const months = habitDoc.months
      .filter((m) => m.year === Number(year))
      .map((m) => {
        // count days that have at least one completed habit
        const totalHabits = m.habits?.length || 0;
        const daysInMonth = new Date(
          Number(year),
          Number(m.month),
          0,
        ).getDate();

        // count unique dates with at least one "completed" status
        const completedDates = new Set();
        m.habits?.forEach((habit) => {
          habit.status?.forEach((s) => {
            if (s.status === "completed") completedDates.add(s.date);
          });
        });

        const completion =
          daysInMonth > 0
            ? Math.round((completedDates.size / daysInMonth) * 100)
            : 0;

        return {
          month: m.month,
          completion, // 0-100
        };
      });

    res.json({ months });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = getMonthsSummary;
