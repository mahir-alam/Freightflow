const pool = require("../config/db");

const truckSelectFields = `
  id,
  truck_number AS "truckCode",
  driver_name AS "driverName",
  truck_type AS "truckType",
  current_location AS "currentLocation",
  availability_status AS "availabilityStatus",
  capacity_tons AS "capacityTons"
`;

const getAllTrucks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ${truckSelectFields}
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
      truckCode,
      driverName,
      truckType,
      currentLocation,
      availabilityStatus,
      capacityTons,
    } = req.body;

    if (
      !truckCode ||
      !driverName ||
      !truckType ||
      !currentLocation ||
      !availabilityStatus ||
      capacityTons === "" ||
      capacityTons === null ||
      capacityTons === undefined
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (Number.isNaN(Number(capacityTons))) {
      return res.status(400).json({ error: "Capacity must be a valid number" });
    }

    const allowedStatuses = ["Available", "Assigned", "Unavailable"];

    if (!allowedStatuses.includes(availabilityStatus)) {
      return res.status(400).json({ error: "Invalid availability status" });
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
      RETURNING ${truckSelectFields};
      `,
      [
        truckCode,
        driverName,
        truckType,
        currentLocation,
        availabilityStatus,
        Number(capacityTons),
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

const updateTruckDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      truckCode,
      driverName,
      truckType,
      currentLocation,
      availabilityStatus,
      capacityTons,
    } = req.body;

    if (
      !truckCode ||
      !driverName ||
      !truckType ||
      !currentLocation ||
      !availabilityStatus ||
      capacityTons === "" ||
      capacityTons === null ||
      capacityTons === undefined
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (Number.isNaN(Number(capacityTons))) {
      return res.status(400).json({ error: "Capacity must be a valid number" });
    }

    const allowedStatuses = ["Available", "Assigned", "Unavailable"];

    if (!allowedStatuses.includes(availabilityStatus)) {
      return res.status(400).json({ error: "Invalid availability status" });
    }

    const existingTruck = await pool.query(
      `
      SELECT id, availability_status
      FROM trucks
      WHERE id = $1
      `,
      [id]
    );

    if (existingTruck.rowCount === 0) {
      return res.status(404).json({ error: "Truck not found" });
    }

    if (
      existingTruck.rows[0].availability_status === "Assigned" &&
      availabilityStatus !== "Assigned"
    ) {
      return res.status(400).json({
        error:
          "Assigned trucks cannot be changed to another availability status here. Unassign the shipment first.",
      });
    }

    const result = await pool.query(
      `
      UPDATE trucks
      SET
        truck_number = $1,
        driver_name = $2,
        truck_type = $3,
        current_location = $4,
        availability_status = $5,
        capacity_tons = $6
      WHERE id = $7
      RETURNING ${truckSelectFields};
      `,
      [
        truckCode,
        driverName,
        truckType,
        currentLocation,
        availabilityStatus,
        Number(capacityTons),
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating truck details:", error.message);

    if (error.code === "23505") {
      return res.status(400).json({ error: "Truck number already exists" });
    }

    res.status(500).json({ error: "Failed to update truck details" });
  }
};

const updateTruckAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availabilityStatus } = req.body;

    const allowedStatuses = ["Available", "Assigned", "Unavailable"];

    if (!allowedStatuses.includes(availabilityStatus)) {
      return res.status(400).json({ error: "Invalid availability status" });
    }

    const truckCheck = await pool.query(
      `
      SELECT id, availability_status
      FROM trucks
      WHERE id = $1
      `,
      [id]
    );

    if (truckCheck.rowCount === 0) {
      return res.status(404).json({ error: "Truck not found" });
    }

    if (
      truckCheck.rows[0].availability_status === "Assigned" &&
      availabilityStatus !== "Assigned"
    ) {
      return res.status(400).json({
        error:
          "Assigned trucks cannot be changed to another availability status here. Unassign the shipment first.",
      });
    }

    const result = await pool.query(
      `
      UPDATE trucks
      SET availability_status = $1
      WHERE id = $2
      RETURNING ${truckSelectFields};
      `,
      [availabilityStatus, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating truck availability:", error.message);
    res.status(500).json({ error: "Failed to update truck availability" });
  }
};

const deleteTruck = async (req, res) => {
  try {
    const { id } = req.params;

    const assignedShipment = await pool.query(
      `
      SELECT id
      FROM shipments
      WHERE assigned_truck_id = $1
      LIMIT 1
      `,
      [id]
    );

    if (assignedShipment.rowCount > 0) {
      return res.status(400).json({
        error: "Cannot delete a truck that is currently assigned to a shipment",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM trucks
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Truck not found" });
    }

    res.json({ message: "Truck deleted successfully" });
  } catch (error) {
    console.error("Error deleting truck:", error.message);
    res.status(500).json({ error: "Failed to delete truck" });
  }
};

module.exports = {
  getAllTrucks,
  createTruck,
  updateTruckDetails,
  updateTruckAvailability,
  deleteTruck,
};