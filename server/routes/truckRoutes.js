const express = require("express");
const router = express.Router();
const {
  getAllTrucks,
  createTruck,
  updateTruckDetails,
  updateTruckAvailability,
  deleteTruck,
} = require("../controllers/truckController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, getAllTrucks);
router.post("/", protect, adminOnly, createTruck);
router.put("/:id", protect, adminOnly, updateTruckDetails);
router.patch("/:id/availability", protect, adminOnly, updateTruckAvailability);
router.delete("/:id", protect, adminOnly, deleteTruck);

module.exports = router;