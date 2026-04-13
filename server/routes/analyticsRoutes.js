const express = require("express");
const router = express.Router();

const { getAnalyticsData } = require("../controllers/analyticsController");
const { protect, adminLikeOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminLikeOnly, getAnalyticsData);

module.exports = router;