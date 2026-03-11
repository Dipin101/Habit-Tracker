const Habits = require("../../models/Habits");

const getAvgSleep = async (req, res) => {
  try {
    const { userId, year, month } = req.params;

    const habitsDoc = await Habits.findOne({ userId });
    if (!habitsDoc) return res.status(404).json({ message: "No habits found" });
    const monthData = habitsDoc.months.find(
      (m) => m.year === parseInt(year) && m.month === month,
    );
    if (!monthData) return res.status(404).json({ message: "Month not found" });
    res.json({ month: monthData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch month data" });
  }
};

module.exports = getAvgSleep;
