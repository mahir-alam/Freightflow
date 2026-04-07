const express = require("express");
const router = express.Router();
const {
  getAllTrucks,
  createTruck,
  updateTruckAvailability,
} = require("../controllers/truckController");

router.get("/", getAllTrucks);
router.post("/", createTruck);
router.patch("/:id/availability", updateTruckAvailability);

module.exports = router;