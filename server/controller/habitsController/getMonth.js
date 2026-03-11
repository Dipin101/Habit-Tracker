const Habits = require("../../models/Habits");

const getMonth = async (req, res) => {
  try {
    const { userId, year, month } = req.params;

    if (!userId || !year || !month) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    const userHabits = await Habits.findOne({ userId });
    if (!userHabits) {
      return res.status(404).json({ message: "User habits not found" });
    }
    const foundMonth = userHabits.months.find(
      (m) => String(m.year) === year && m.month === month,
    );
    if (!foundMonth) {
      return res.status(404).json({ message: "Month not found" });
    }
    res.status(200).json({ month: foundMonth });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = getMonth;
