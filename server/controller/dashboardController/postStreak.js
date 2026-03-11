const { DateTime } = require("luxon");
const Users = require("../../models/Users");

const postStreak = async (req, res) => {
  try {
    const { userId, today } = req.body;

    const user = await Users.findOne({ firebaseUid: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const todayDate = DateTime.fromISO(today).toISODate();
    const lastLogin = user.lastLoginDate
      ? DateTime.fromISO(user.lastLoginDate).toISODate()
      : null;

    let newStreak = 0;

    if (!lastLogin) {
      newStreak = 0;
    } else {
      const yesterday = DateTime.fromISO(today).minus({ days: 1 }).toISODate();
      if (lastLogin === todayDate) {
        newStreak = user.streak;
      } else if (lastLogin === yesterday) {
        newStreak = user.streak + 1;
      } else {
        newStreak = 0;
      }
    }

    user.streak = newStreak;
    user.lastLoginDate = todayDate;
    await user.save();

    res.json({ streak: newStreak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to calculate streak" });
  }
};

module.exports = postStreak;
