const User = require("../../models/Users");

const register = async (req, res) => {
  try {
    let { firstName, lastName, email, phone, firebaseUid } = req.body;

    console.log(phone);
    const phoneNumber = Number(phone);
    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({
        error: "User already exists",
        user: {
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          firebaseUid: existingUser.firebaseUid,
          phone: existingUser.phone,
        },
      });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone: phoneNumber,
      firebaseUid,
    });

    console.log("saving user to mongoDB", newUser);
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        firebaseUid: newUser.firebaseUid,
        phone: newUser.phone,
      },
    });
  } catch (err) {
    console.log("This is from register", err);
    res.status(500).json({ error: "Server error hehee", details: err.message });
  }
};

module.exports = register;
