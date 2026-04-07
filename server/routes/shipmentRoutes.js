const express = require("express");
const router = express.Router();
const {
  getAllShipments,
  createShipment,
} = require("../controllers/shipmentController");

router.get("/", getAllShipments);
router.post("/", createShipment);

module.exports = router;