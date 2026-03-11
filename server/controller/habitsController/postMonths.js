const Habits = require("../../models/Habits");

const postMonths = async (req, res) => {
  try {
    const { userId, year, month, trackSleepModal, sleepTrackingStart } =
      req.body;

    if (!userId || !year || !month) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    let userHabits = await Habits.findOne({ userId });

    if (!userHabits) {
      userHabits = new Habits({ userId, months: [] });
    }

    const monthExists = userHabits.months.some(
      (m) =>
        Number(m.year) === Number(year) && String(m.month) === String(month),
    );

    if (monthExists) {
      const monthDoc = userHabits.months.find(
        (m) =>
          Number(m.year) === Number(year) && String(m.month) === String(month),
      );

      if (trackSleepModal) {
        monthDoc.trackSleep = true;
        monthDoc.sleepTrackingStart =
          sleepTrackingStart ?? new Date().toISOString();
      }

      await userHabits.save();
      return res.status(200).json({ month: monthDoc });
    }

    userHabits.months.push({
      year,
      month,
      memorable: [],
      habits: [],
      sleep: [],
      trackSleep: trackSleepModal,
      sleepTrackingStart: trackSleepModal ? sleepTrackingStart : null,
    });

    await userHabits.save();

    const addedMonth = userHabits.months.find(
      (m) => m.year === year && m.month === month,
    );

    res.status(201).json({ month: addedMonth });
  } catch (err) {
    res.status(500).json({ error: "Abe laude Server error" });
  }
};

module.exports = postMonths;
