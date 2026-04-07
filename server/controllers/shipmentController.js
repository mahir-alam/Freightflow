const pool = require("../config/db");

const getAllShipments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.client_name AS "clientName",
        s.pickup_location AS "pickupLocation",
        s.dropoff_location AS "dropoffLocation",
        s.shipment_date AS "shipmentDate",
        s.truck_type AS "truckType",
        s.status,
        s.negotiated_price_bdt AS "negotiatedPrice",
        s.commission_amount_bdt AS "commissionAmount",
        s.assigned_truck_id AS "assignedTruckId",
        t.truck_number AS "assignedTruckCode"
      FROM shipments s
      LEFT JOIN trucks t ON s.assigned_truck_id = t.id
      ORDER BY s.shipment_date DESC, s.id DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching shipments:", error.message);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
};

const createShipment = async (req, res) => {
  try {
    const {
      clientName,
      pickupLocation,
      dropoffLocation,
      shipmentDate,
      truckType,
      status,
      negotiatedPrice,
      commissionAmount,
    } = req.body;

    if (
      !clientName ||
      !pickupLocation ||
      !dropoffLocation ||
      !shipmentDate ||
      !truckType ||
      !status ||
      negotiatedPrice === "" ||
      commissionAmount === ""
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const allowedStatuses = ["Pending", "Assigned", "In Transit", "Completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid shipment status" });
    }

    const result = await pool.query(
      `
      INSERT INTO shipments (
        client_name,
        pickup_location,
        dropoff_location,
        shipment_date,
        truck_type,
        status,
        negotiated_price_bdt,
        commission_amount_bdt
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        client_name AS "clientName",
        pickup_location AS "pickupLocation",
        dropoff_location AS "dropoffLocation",
        shipment_date AS "shipmentDate",
        truck_type AS "truckType",
        status,
        negotiated_price_bdt AS "negotiatedPrice",
        commission_amount_bdt AS "commissionAmount",
        assigned_truck_id AS "assignedTruckId";
      `,
      [
        clientName,
        pickupLocation,
        dropoffLocation,
        shipmentDate,
        truckType,
        status,
        negotiatedPrice,
        commissionAmount,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating shipment:", error.message);
    res.status(500).json({ error: "Failed to create shipment" });
  }
};

const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Assigned", "In Transit", "Completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid shipment status" });
    }

    const currentShipmentResult = await pool.query(
      `
      SELECT id, status, assigned_truck_id
      FROM shipments
      WHERE id = $1
      `,
      [id]
    );

    if (currentShipmentResult.rowCount === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const currentShipment = currentShipmentResult.rows[0];
    const currentStatus = currentShipment.status;
    const assignedTruckId = currentShipment.assigned_truck_id;

    const allowedTransitions = {
      Pending: ["Assigned"],
      Assigned: ["In Transit"],
      "In Transit": ["Completed"],
      Completed: [],
    };

    if (!allowedTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        error: `Cannot change shipment status from ${currentStatus} to ${status}`,
      });
    }

    const result = await pool.query(
      `
      UPDATE shipments
      SET status = $1
      WHERE id = $2
      RETURNING
        id,
        client_name AS "clientName",
        pickup_location AS "pickupLocation",
        dropoff_location AS "dropoffLocation",
        shipment_date AS "shipmentDate",
        truck_type AS "truckType",
        status,
        negotiated_price_bdt AS "negotiatedPrice",
        commission_amount_bdt AS "commissionAmount",
        assigned_truck_id AS "assignedTruckId";
      `,
      [status, id]
    );

    if (status === "Completed" && assignedTruckId) {
      await pool.query(
        `
        UPDATE trucks
        SET availability_status = 'Available'
        WHERE id = $1
        `,
        [assignedTruckId]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating shipment status:", error.message);
    res.status(500).json({ error: "Failed to update shipment status" });
  }
};

const assignTruckToShipment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { truckId } = req.body;

    if (!truckId) {
      return res.status(400).json({ error: "Truck ID is required" });
    }

    await client.query("BEGIN");

    const shipmentResult = await client.query(
      `
      SELECT id, status, assigned_truck_id
      FROM shipments
      WHERE id = $1
      `,
      [id]
    );

    if (shipmentResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Shipment not found" });
    }

    const shipment = shipmentResult.rows[0];

    if (shipment.status !== "Pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Only pending shipments can be assigned a truck",
      });
    }

    if (shipment.assigned_truck_id) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Shipment already has an assigned truck",
      });
    }

    const truckResult = await client.query(
      `
      SELECT id, availability_status
      FROM trucks
      WHERE id = $1
      `,
      [truckId]
    );

    if (truckResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Truck not found" });
    }

    if (truckResult.rows[0].availability_status !== "Available") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Selected truck is not available" });
    }

    await client.query(
      `
      UPDATE shipments
      SET assigned_truck_id = $1,
          status = 'Assigned'
      WHERE id = $2
      `,
      [truckId, id]
    );

    await client.query(
      `
      UPDATE trucks
      SET availability_status = 'Assigned'
      WHERE id = $1
      `,
      [truckId]
    );

    const updatedShipment = await client.query(
      `
      SELECT
        s.id,
        s.client_name AS "clientName",
        s.pickup_location AS "pickupLocation",
        s.dropoff_location AS "dropoffLocation",
        s.shipment_date AS "shipmentDate",
        s.truck_type AS "truckType",
        s.status,
        s.negotiated_price_bdt AS "negotiatedPrice",
        s.commission_amount_bdt AS "commissionAmount",
        s.assigned_truck_id AS "assignedTruckId",
        t.truck_number AS "assignedTruckCode"
      FROM shipments s
      LEFT JOIN trucks t ON s.assigned_truck_id = t.id
      WHERE s.id = $1
      `,
      [id]
    );

    await client.query("COMMIT");

    res.json(updatedShipment.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error assigning truck:", error.message);
    res.status(500).json({ error: "Failed to assign truck to shipment" });
  } finally {
    client.release();
  }
};

const getRecommendedTrucksForShipment = async (req, res) => {
  try {
    const { id } = req.params;

    const shipmentResult = await pool.query(
      `
      SELECT id, truck_type, pickup_location, status, assigned_truck_id
      FROM shipments
      WHERE id = $1
      `,
      [id]
    );

    if (shipmentResult.rowCount === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const shipment = shipmentResult.rows[0];

    if (shipment.status !== "Pending") {
      return res.status(400).json({
        error: "Recommendations are only available for pending shipments",
      });
    }

    if (shipment.assigned_truck_id) {
      return res.status(400).json({
        error: "Shipment already has an assigned truck",
      });
    }

    const truckResult = await pool.query(
      `
      SELECT
        id,
        truck_number AS "truckCode",
        driver_name AS "driverName",
        truck_type AS "truckType",
        current_location AS "currentLocation",
        availability_status AS "availabilityStatus",
        capacity_tons AS "capacityTons",
        CASE
          WHEN truck_type = $1 AND current_location = $2 THEN 1
          WHEN truck_type = $1 THEN 2
          WHEN current_location = $2 THEN 3
          ELSE 4
        END AS recommendation_rank
      FROM trucks
      WHERE availability_status = 'Available'
      ORDER BY recommendation_rank ASC, id DESC
      `,
      [shipment.truck_type, shipment.pickup_location]
    );

    res.json(truckResult.rows);
  } catch (error) {
    console.error("Error fetching recommended trucks:", error.message);
    res.status(500).json({ error: "Failed to fetch recommended trucks" });
  }
};

const deleteShipment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const shipmentResult = await client.query(
      `
      SELECT assigned_truck_id
      FROM shipments
      WHERE id = $1
      `,
      [id]
    );

    if (shipmentResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Shipment not found" });
    }

    const assignedTruckId = shipmentResult.rows[0].assigned_truck_id;

    await client.query(
      `
      DELETE FROM shipments
      WHERE id = $1
      `,
      [id]
    );

    if (assignedTruckId) {
      await client.query(
        `
        UPDATE trucks
        SET availability_status = 'Available'
        WHERE id = $1
        `,
        [assignedTruckId]
      );
    }

    await client.query("COMMIT");

    res.json({ message: "Shipment deleted successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting shipment:", error.message);
    res.status(500).json({ error: "Failed to delete shipment" });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllShipments,
  createShipment,
  updateShipmentStatus,
  assignTruckToShipment,
  getRecommendedTrucksForShipment,
  deleteShipment,
};