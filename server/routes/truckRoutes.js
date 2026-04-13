const express = require("express");
const router = express.Router();

const {
  getAllTrucks,
  createTruck,
  updateTruck,
  updateTruckAvailability,
  deleteTruck,
} = require("../controllers/truckController");

const { protect, adminLikeOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminLikeOnly, getAllTrucks);
router.post("/", protect, adminLikeOnly, createTruck);
router.put("/:id", protect, adminLikeOnly, updateTruck);
router.patch("/:id/availability", protect, adminLikeOnly, updateTruckAvailability);
router.delete("/:id", protect, adminLikeOnly, deleteTruck);

module.exports = router;