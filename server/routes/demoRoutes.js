const express = require("express");
const router = express.Router();

const { resetDemoData } = require("../controllers/demoController");
const { protect, adminLikeOnly } = require("../middleware/authMiddleware");

router.post("/reset", protect, adminLikeOnly, resetDemoData);

module.exports = router;