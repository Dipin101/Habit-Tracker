const Users = require("../../models/Users");

const signin = async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(404).json({ error: "Firebase UID is required" });
    }

    const user = await Users.findOne({ firebaseUid });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: "Nincompot" });
  }
};

module.exports = signin;
