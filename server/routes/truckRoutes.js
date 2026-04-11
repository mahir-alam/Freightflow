const express = require("express");
const router = express.Router();
const {
  getAllTrucks,
  createTruck,
  updateTruckAvailability,
} = require("../controllers/truckController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, getAllTrucks);
router.post("/", protect, adminOnly, createTruck);
router.patch("/:id/availability", protect, adminOnly, updateTruckAvailability);

module.exports = router;