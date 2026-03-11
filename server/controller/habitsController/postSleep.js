const Habits = require("../../models/Habits");

const postSleep = async (req, res) => {
  try {
    const { userId, year, month, day, hour } = req.body;

    const user = await Habits.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User doesn't exist" });

    let monthData = user.months.find(
      (m) =>
        String(m.year) === String(year) && String(m.month) === String(month),
    );

    if (!monthData) {
      return res.status(404).json({ message: "Month not found for this user" });
    }

    const dayIndex = monthData.sleep.findIndex(
      (d) => Number(d.day) === Number(day),
    );
    if (dayIndex === -1) {
      monthData.sleep.push({
        day: Number(day),
        month: Number(month),
        year: year,
        hours: hour,
      });
    } else {
      monthData.sleep[dayIndex].hours = hour;
    }

    await user.save();
    res.status(200).json({ message: "Sleep saved successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error from post sleep" });
  }
};

module.exports = postSleep;
