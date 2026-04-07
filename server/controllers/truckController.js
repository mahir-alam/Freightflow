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

const createTruck = async (req, res) => {
  try {
    const {
      truckNumber,
      driverName,
      truckType,
      currentLocation,
      availabilityStatus,
      capacityTons,
    } = req.body;

    if (
      !truckNumber ||
      !driverName ||
      !truckType ||
      !currentLocation ||
      !availabilityStatus ||
      capacityTons === ""
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      `
      INSERT INTO trucks (
        truck_number,
        driver_name,
        truck_type,
        current_location,
        availability_status,
        capacity_tons
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        truck_number AS "truckNumber",
        driver_name AS "driverName",
        truck_type AS "truckType",
        current_location AS "currentLocation",
        availability_status AS "availabilityStatus",
        capacity_tons AS "capacityTons";
      `,
      [
        truckNumber,
        driverName,
        truckType,
        currentLocation,
        availabilityStatus,
        capacityTons,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating truck:", error.message);

    if (error.code === "23505") {
      return res.status(400).json({ error: "Truck number already exists" });
    }

    res.status(500).json({ error: "Failed to create truck" });
  }
};

module.exports = {
  getAllTrucks,
  createTruck,
};