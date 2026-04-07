const pool = require("../config/db");

const getAllTrucks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        truck_number AS "truckNumber",
        driver_name AS "driverName",
        truck_type AS "truckType",
        current_location AS "currentLocation",
        availability_status AS "availabilityStatus",
        capacity_tons AS "capacityTons"
      FROM trucks
      ORDER BY id DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching trucks:", error.message);
    res.status(500).json({ error: "Failed to fetch trucks" });
  }
};

module.exports = {
  getAllTrucks,
};