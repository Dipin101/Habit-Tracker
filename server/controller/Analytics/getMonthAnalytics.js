const { getHabitsForMonth } = require("../habitsController/getHabits");
const { getSleepForMonth } = require("../habitsController/getSleep");
const { getMoodForMonth } = require("../dashboardController/MoodController");
const { getMemorableForMonth } = require("../habitsController/getMemorable");

const getMonthAnalytics = async (req, res) => {
  const { userId, year, month } = req.params;

  try {
    const [habits, sleep, mood, memorable] = await Promise.all([
      getHabitsForMonth(userId, year, month),
      getSleepForMonth(userId, year, month),
      getMoodForMonth(userId, year, month),
      getMemorableForMonth(userId, year, month),
    ]);

    res.json({
      habits: habits.map((h) => ({
        name: h.title,
        completedDays: h.status
          .filter((s) => s.status === "completed")
          .map((s) => parseInt(s.date.split("-")[2])),
        comments: h.comment.reduce(
          (acc, c) => ({ ...acc, [parseInt(c.date.split("-")[2])]: c.text }),
          {},
        ),
      })),
      sleep: sleep.map((s) => ({
        day: s.day,
        hours: +(s.hours / 60).toFixed(1), // convert minutes → hours
      })),
      mood: mood.map((m) => ({
        day: parseInt(m.date.split("-")[2]),
        score: Math.round(m.rating / 2),
      })),
      memorable: memorable.map((m) => ({
        day: m.day,
        title: m.summary,
        journal: m.journal,
        favourite: m.favourite ?? false,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = getMonthAnalytics;
