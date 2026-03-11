const User = require("../../models/Users"); // same model as register

const updateProfile = async (req, res) => {
  try {
    const { firebaseUid, ...rest } = req.body;

    // remove undefined fields so we only update what was sent
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => v !== undefined && v !== null),
    );

    // handle phone conversion only if phone was sent
    if (fieldsToUpdate.phone) {
      fieldsToUpdate.phone = Number(fieldsToUpdate.phone);
    }

    const updated = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: fieldsToUpdate }, // ✅ $set only updates the fields provided
      { new: true },
    );

    if (!updated) return res.status(404).json({ error: "User not found" });

    res.json({
      success: true,
      userData: {
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        email: updated.email,
      },
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

module.exports = updateProfile;
