const express = require("express");
const router = express.Router();
const { getAllShipments } = require("../controllers/shipmentController");

router.get("/", getAllShipments);

module.exports = router;