const Habits = require("../../models/Habits");

const getHabits = async (req, res) => {
  try {
    // console.log(`api hit`);
    const { userId } = req.params;
    const { month, year } = req.query;

    const habitsDoc = await Habits.findOne({ userId });
    if (!habitsDoc) return res.status(404).json({ message: "No habits found" });

    //Find month Data
    const monthData = habitsDoc.months.find(
      (m) => m.month === month && String(m.year) === String(year),
    );

    if (!monthData)
      return res.status(404).json({ message: "No data for this month." });

    res.json(monthData);
  } catch (err) {
    return res.status(500).json({ "Internal Server Error": err });
  }
};

const getHabitsForMonth = async (userId, year, month) => {
  const habitsDoc = await Habits.findOne({ userId });
  if (!habitsDoc) return [];

  const monthData = habitsDoc.months.find(
    (m) => m.month === month && String(m.year) === String(year),
  );

  return monthData?.habits ?? [];
};

module.exports = { getHabits, getHabitsForMonth };
