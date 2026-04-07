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

router.get("/", getAllShipments);
router.post("/", createShipment);
router.get("/:id/recommend-trucks", getRecommendedTrucksForShipment);
router.patch("/:id/status", updateShipmentStatus);
router.patch("/:id/assign-truck", assignTruckToShipment);
router.delete("/:id", deleteShipment);

module.exports = router;