// routes/notifications.js
// Mount this in your app.js: app.use("/api/users", notificationRouter);

const express = require("express");
const router = express.Router();
const cron = require("node-cron");
const admin = require("firebase-admin");
const User = require("../models/Users");

// ─── Firebase Admin SDK init ──────────────────────────────────────────────────
// Download your service account key from:
// Firebase Console → Project Settings → Service Accounts → Generate new private key
// Save it as serviceAccountKey.json in your project root (add to .gitignore!)

if (!admin.apps.length) {
  const serviceAccount = require(process.env.FIRE_BASE_CREDENTIAL);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ─── PATCH /api/users/fcm-token ───────────────────────────────────────────────
// Called by the frontend hook to save/update a user's FCM token
router.patch("/fcm-token", async (req, res) => {
  const { firebaseUid, fcmToken } = req.body;

  if (!firebaseUid || !fcmToken) {
    return res
      .status(400)
      .json({ error: "firebaseUid and fcmToken are required" });
  }

  try {
    await User.findOneAndUpdate({ firebaseUid }, { fcmToken }, { new: true });
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving FCM token:", err);
    res.status(500).json({ error: "Failed to save token" });
  }
});

// ─── Helper: send push to all users with a token ─────────────────────────────
async function sendPushToAll(title, body) {
  try {
    const users = await User.find({ fcmToken: { $ne: null } }).select(
      "fcmToken",
    );
    if (!users.length) {
      console.log("[CRON] No users with FCM tokens");
      return;
    }

    const tokens = users.map((u) => u.fcmToken);

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      webpush: {
        notification: {
          icon: "/logo192.png",
          badge: "/logo192.png",
          tag: "habit-reminder",
          renotify: true,
        },
      },
    });

    console.log(
      `[CRON] Sent ${response.successCount}/${tokens.length} notifications`,
    );

    // Clean up stale/invalid tokens
    response.responses.forEach(async (resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        if (
          errorCode === "messaging/registration-token-not-registered" ||
          errorCode === "messaging/invalid-registration-token"
        ) {
          await User.findOneAndUpdate(
            { fcmToken: tokens[idx] },
            { fcmToken: null },
          );
          console.log(`[CRON] Cleared stale token for index ${idx}`);
        }
      }
    });
  } catch (err) {
    console.error("[CRON] Error sending notifications:", err);
  }
}

// ─── Cron Jobs ────────────────────────────────────────────────────────────────
// Runs at 12:00 PM every day
cron.schedule(
  "0 12 * * *",
  () => {
    console.log("[CRON] Firing Testing");
    sendPushToAll(
      "Midday Check-in 🌞",
      "How are your habits going today? Don't let the day slip away!",
    );
  },
  { timezone: "America/Toronto" },
);

// Runs at 11:59 PM every day
cron.schedule(
  "59 23 * * *",
  () => {
    console.log("[CRON] Firing 11:59 PM reminder");
    sendPushToAll(
      "Last Call 🌙",
      "Before midnight — did you complete your habits today?",
    );
  },
  { timezone: "America/Toronto" },
);

console.log(
  "[CRON] Schedulers registered: 12:00 PM + 11:59 PM (America/Toronto)",
);

module.exports = router;
