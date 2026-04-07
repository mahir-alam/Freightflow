const express = require("express");
const router = express.Router();
const { getAllTrucks } = require("../controllers/truckController");

router.get("/", getAllTrucks);

module.exports = router;