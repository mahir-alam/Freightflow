const express = require("express");
const router = express.Router();
const {
  getAllShipments,
  createShipment,
  updateShipmentStatus,
  deleteShipment,
} = require("../controllers/shipmentController");

router.get("/", getAllShipments);
router.post("/", createShipment);
router.patch("/:id/status", updateShipmentStatus);
router.delete("/:id", deleteShipment);

module.exports = router;