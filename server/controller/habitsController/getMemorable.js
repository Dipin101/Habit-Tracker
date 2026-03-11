const Habits = require("../../models/Habits");

const getMemorable = async (req, res) => {
  try {
    // console.log("Hitting api");
    const { userId, year, month, day } = req.params;

    if (!userId || !year || !month || !day) {
      return res.status(400).json({ message: "Missing required params" });
    }

    // console.log(month, year);

    const userHabits = await Habits.findOne({ userId });
    if (!userHabits) return res.status(404).json({ message: "User not found" });

    const monthData = userHabits.months.find(
      (m) =>
        Number(m.year) === Number(year) && String(m.month) === String(month),
    );
    if (!monthData)
      return res.status(404).json({ message: "No month data found" });

    const dayData = monthData.memorable.find(
      (d) => Number(d.day) === Number(day),
    );

    if (!dayData)
      return res.status(404).json({ message: "No summary found for today" });

    res.status(200).json(dayData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const getMemorableForMonth = async (userId, year, month) => {
  const userHabits = await Habits.findOne({ userId });
  if (!userHabits) return [];

  const monthData = userHabits.months.find(
    (m) => Number(m.year) === Number(year) && String(m.month) === String(month),
  );
  if (!monthData) return [];

  return monthData.memorable ?? [];
};

module.exports = { getMemorable, getMemorableForMonth };
