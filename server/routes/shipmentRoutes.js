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

const { protect, adminLikeOnly } = require("../middleware/authMiddleware");

router.get("/", protect, getAllShipments);
router.post("/", protect, createShipment);

router.get("/route-pricing-insights", protect, adminLikeOnly, getRoutePricingInsights);

router.put("/:id", protect, adminLikeOnly, updateShipment);
router.get("/:id/recommend-trucks", protect, adminLikeOnly, getRecommendedTrucksForShipment);
router.patch("/:id/status", protect, adminLikeOnly, updateShipmentStatus);
router.patch("/:id/assign-truck", protect, adminLikeOnly, assignTruckToShipment);
router.patch("/:id/unassign-truck", protect, adminLikeOnly, unassignTruckFromShipment);
router.delete("/:id", protect, adminLikeOnly, deleteShipment);

module.exports = router;