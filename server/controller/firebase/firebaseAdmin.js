require("dotenv").config({ path: __dirname + "/../../config/.env" });
const admin = require("firebase-admin");

let serviceAccount;

if (process.env.NODE_ENV === "production") {
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
} else {
  serviceAccount = require(process.env.FIRE_BASE_CREDENTIAL);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
