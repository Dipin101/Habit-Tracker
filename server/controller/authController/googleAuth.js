const User = require("../../models/Users");
const admin = require("../firebase/firebaseAdmin");

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "ID token is required" });
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid: firebaseUid, email, name, phone } = decodedToken;

    const [firstName, ...lastNameArr] = (name || "").split(" ");
    const lastName = lastNameArr.join(" ") || "Unknown";
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = new User({
        firstName,
        lastName,
        email,
        phone: phone || null,
        firebaseUid,
      });
      await user.save();
      console.log("Existing user signed in via Google:", user);
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error("Google Auth error: ", err);
    res.status(500).json({ error: "Google Auth failed", details: err.message });
  }
};

module.exports = googleAuth;
