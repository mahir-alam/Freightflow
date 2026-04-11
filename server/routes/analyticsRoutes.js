const express = require("express");
const router = express.Router();
const { getAnalyticsData } = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, getAnalyticsData);

module.exports = router;