const Habits = require("../../models/Habits");

const getSleep = async (req, res) => {
  try {
    const { userId, year, month } = req.params;

    const user = await Habits.findOne({ userId });
    if (!user) return res.status(404).json({ message: "Not found user" });

    const paddedMonth = String(month).padStart(2, "0");
    const monthData = user.months.find(
      (m) => Number(m.year) === Number(year) && String(m.month) === paddedMonth,
    );
    if (!monthData) {
      return res.status(404).json({ message: "Month is not there." });
    }

    const sleepData = monthData.sleep || [];

    return res.json(sleepData);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "I dont know what went wrong here." });
  }
};

const getSleepForMonth = async (userId, year, month) => {
  const user = await Habits.findOne({ userId });
  if (!user) return [];

  const paddedMonth = String(month).padStart(2, "0");

  const monthData = user.months.find(
    (m) => Number(m.year) === Number(year) && String(m.month) === paddedMonth,
  );
  if (!monthData) return [];

  return monthData.sleep ?? [];
};

module.exports = { getSleep, getSleepForMonth };
