const express = require("express");
const router = express.Router();
const {
  getAllShipments,
  createShipment,
  deleteShipment,
} = require("../controllers/shipmentController");

router.get("/", getAllShipments);
router.post("/", createShipment);
router.delete("/:id", deleteShipment);

module.exports = router;