const express = require("express");
const router = express.Router();
const {
  getAllShipments,
  createShipment,
  updateShipmentStatus,
  assignTruckToShipment,
  getRecommendedTrucksForShipment,
  deleteShipment,
} = require("../controllers/shipmentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, getAllShipments);
router.post("/", protect, createShipment);
router.get("/:id/recommend-trucks", protect, adminOnly, getRecommendedTrucksForShipment);
router.patch("/:id/status", protect, adminOnly, updateShipmentStatus);
router.patch("/:id/assign-truck", protect, adminOnly, assignTruckToShipment);
router.delete("/:id", protect, adminOnly, deleteShipment);

module.exports = router;