const express = require("express");
const register = require("../controller/authController/register");
const signin = require("../controller/authController/signin");
const googleAuth = require("../controller/authController/googleAuth");
const getUser = require("../controller/getUser");
const getProfile = require("../controller/profileController/getProfile");
const postMonths = require("../controller/habitsController/postMonths");
const getMonth = require("../controller/habitsController/getMonth");
const createMemorable = require("../controller/habitsController/createMemorable");
const { getMemorable } = require("../controller/habitsController/getMemorable");
const postHabits = require("../controller/habitsController/postHabits");
const { getHabits } = require("../controller/habitsController/getHabits");
const postSleep = require("../controller/habitsController/postSleep");
const { getSleep } = require("../controller/habitsController/getSleep");
const getQuote = require("../controller/habitsController/getQuote");
const postStreak = require("../controller/dashboardController/postStreak");
const getTodayCompletion = require("../controller/dashboardController/getTodayCompletion");
const getAvgSleep = require("../controller/dashboardController/getAvgSleep");
const getMonthlyOverview = require("../controller/dashboardController/getMonthlyOverview");
const updateProfile = require("../controller/profileController/updateProfile");
const {
  getTodayMood,
  saveTodayMood,
} = require("../controller/dashboardController/MoodController");
const getMonthsSummary = require("../controller/Analytics/getMonthsSummary");
const getMonthAnalytics = require("../controller/Analytics/getMonthAnalytics");
const getNotification = require("../controller/getNotification");

const router = express.Router();

router.post("/register", register);
router.post("/signin", signin);
router.post("/googleauth", googleAuth);
router.post("/getUser", getUser);
router.post("/getProfile", getProfile);
router.post("/months", postMonths);
router.get("/months/:userId/:year/:month", getMonth);
router.post("/memorable", createMemorable);
router.get("/memorable/:userId/:year/:month/:day", getMemorable);
router.post("/habits", postHabits);
router.get("/habits/:userId", getHabits);
router.post("/sleep/", postSleep);
router.get("/sleep/:userId/:year/:month", getSleep);
router.get("/quote", getQuote);
router.post("/streak", postStreak);
router.post("/today-completion", getTodayCompletion);
router.get("/avgsleep/:userId/:year/:month", getAvgSleep);
router.post("/monthly-overview", getMonthlyOverview);
router.post("/mood-today", getTodayMood);
router.post("/mood-save", saveTodayMood);
router.patch("/updateProfile", updateProfile);
router.get("/months-summary/:userId/:year", getMonthsSummary);
router.get("/analytics/:userId/:year/:month", getMonthAnalytics);
router.patch("/fcm-token", getNotification);

module.exports = router;
