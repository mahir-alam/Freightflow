const express = require("express");
const router = express.Router();
const {
  getAllTrucks,
  createTruck,
} = require("../controllers/truckController");

router.get("/", getAllTrucks);
router.post("/", createTruck);

module.exports = router;