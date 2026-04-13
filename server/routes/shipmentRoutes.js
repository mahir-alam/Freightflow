const express = require("express");
const router = express.Router();

const {
  getAllShipments,
  createShipment,
  updateShipment,
  updateShipmentStatus,
  assignTruckToShipment,
  unassignTruckFromShipment,
  getRecommendedTrucksForShipment,
  getRoutePricingInsights,
  deleteShipment,
} = require("../controllers/shipmentController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, getAllShipments);
router.post("/", protect, createShipment);

router.get("/route-pricing-insights", protect, adminOnly, getRoutePricingInsights);

router.put("/:id", protect, adminOnly, updateShipment);
router.get("/:id/recommend-trucks", protect, adminOnly, getRecommendedTrucksForShipment);
router.patch("/:id/status", protect, adminOnly, updateShipmentStatus);
router.patch("/:id/assign-truck", protect, adminOnly, assignTruckToShipment);
router.patch("/:id/unassign-truck", protect, adminOnly, unassignTruckFromShipment);
router.delete("/:id", protect, adminOnly, deleteShipment);

module.exports = router;