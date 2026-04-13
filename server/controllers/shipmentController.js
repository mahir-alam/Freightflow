const pool = require("../config/db");

const shipmentSelectFields = `
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
  s.client_user_id AS "clientUserId",
  t.truck_number AS "assignedTruckCode"
`;

const getAllShipments = async (req, res) => {
  try {
    let query = "";
    let values = [];

    if (req.user.role === "admin") {
      query = `
        SELECT ${shipmentSelectFields}
        FROM shipments s
        LEFT JOIN trucks t ON s.assigned_truck_id = t.id
        ORDER BY s.shipment_date DESC, s.id DESC;
      `;
    } else {
      query = `
        SELECT ${shipmentSelectFields}
        FROM shipments s
        LEFT JOIN trucks t ON s.assigned_truck_id = t.id
        WHERE s.client_user_id = $1
        ORDER BY s.shipment_date DESC, s.id DESC;
      `;
      values = [req.user.id];
    }

    const result = await pool.query(query, values);
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
      negotiatedPrice === "" ||
      negotiatedPrice === null ||
      negotiatedPrice === undefined ||
      commissionAmount === "" ||
      commissionAmount === null ||
      commissionAmount === undefined
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (
      Number.isNaN(Number(negotiatedPrice)) ||
      Number.isNaN(Number(commissionAmount))
    ) {
      return res
        .status(400)
        .json({ error: "Price and commission must be valid numbers" });
    }

    const allowedStatuses = ["Pending", "Assigned", "In Transit", "Completed"];

    let finalStatus = "Pending";

    if (req.user.role === "admin" && status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid shipment status" });
      }

      finalStatus = status;
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
        commission_amount_bdt,
        client_user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
        assigned_truck_id AS "assignedTruckId",
        client_user_id AS "clientUserId";
      `,
      [
        clientName,
        pickupLocation,
        dropoffLocation,
        shipmentDate,
        truckType,
        finalStatus,
        Number(negotiatedPrice),
        Number(commissionAmount),
        req.user.id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating shipment:", error.message);
    res.status(500).json({ error: "Failed to create shipment" });
  }
};

const updateShipmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientName,
      pickupLocation,
      dropoffLocation,
      shipmentDate,
      truckType,
      negotiatedPrice,
      commissionAmount,
    } = req.body;

    if (
      !clientName ||
      !pickupLocation ||
      !dropoffLocation ||
      !shipmentDate ||
      !truckType ||
      negotiatedPrice === "" ||
      negotiatedPrice === null ||
      negotiatedPrice === undefined ||
      commissionAmount === "" ||
      commissionAmount === null ||
      commissionAmount === undefined
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (
      Number.isNaN(Number(negotiatedPrice)) ||
      Number.isNaN(Number(commissionAmount))
    ) {
      return res
        .status(400)
        .json({ error: "Price and commission must be valid numbers" });
    }

    const existingShipment = await pool.query(
      `
      SELECT id, status, assigned_truck_id, truck_type
      FROM shipments
      WHERE id = $1
      `,
      [id]
    );

    if (existingShipment.rowCount === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const shipment = existingShipment.rows[0];

    if (shipment.status === "Completed") {
      return res
        .status(400)
        .json({ error: "Completed shipments cannot be edited" });
    }

    if (
      shipment.assigned_truck_id &&
      truckType.trim() !== shipment.truck_type.trim()
    ) {
      return res.status(400).json({
        error:
          "Cannot change truck type while a truck is assigned. Unassign first or keep the same truck type.",
      });
    }

    const result = await pool.query(
      `
      UPDATE shipments
      SET
        client_name = $1,
        pickup_location = $2,
        dropoff_location = $3,
        shipment_date = $4,
        truck_type = $5,
        negotiated_price_bdt = $6,
        commission_amount_bdt = $7
      WHERE id = $8
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
        assigned_truck_id AS "assignedTruckId",
        client_user_id AS "clientUserId";
      `,
      [
        clientName,
        pickupLocation,
        dropoffLocation,
        shipmentDate,
        truckType,
        Number(negotiatedPrice),
        Number(commissionAmount),
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating shipment details:", error.message);
    res.status(500).json({ error: "Failed to update shipment details" });
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

    if (status === "Assigned" && !assignedTruckId) {
      return res.status(400).json({
        error: "A truck must be assigned before moving shipment to Assigned",
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
        assigned_truck_id AS "assignedTruckId",
        client_user_id AS "clientUserId";
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
      SELECT id, status, assigned_truck_id, truck_type
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
      SELECT id, availability_status, truck_type
      FROM trucks
      WHERE id = $1
      `,
      [truckId]
    );

    if (truckResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Truck not found" });
    }

    const truck = truckResult.rows[0];

    if (truck.availability_status !== "Available") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Selected truck is not available" });
    }

    if (truck.truck_type.trim() !== shipment.truck_type.trim()) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Selected truck type does not match shipment truck type",
      });
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
      SELECT ${shipmentSelectFields}
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

const unassignTruckFromShipment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

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

    if (!shipment.assigned_truck_id) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Shipment has no assigned truck" });
    }

    if (shipment.status === "In Transit" || shipment.status === "Completed") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Cannot unassign truck from a shipment already in transit or completed",
      });
    }

    await client.query(
      `
      UPDATE shipments
      SET assigned_truck_id = NULL,
          status = 'Pending'
      WHERE id = $1
      `,
      [id]
    );

    await client.query(
      `
      UPDATE trucks
      SET availability_status = 'Available'
      WHERE id = $1
      `,
      [shipment.assigned_truck_id]
    );

    const updatedShipment = await client.query(
      `
      SELECT ${shipmentSelectFields}
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
    console.error("Error unassigning truck:", error.message);
    res.status(500).json({ error: "Failed to unassign truck from shipment" });
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
        AND truck_type = $1
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
  updateShipmentDetails,
  updateShipmentStatus,
  assignTruckToShipment,
  unassignTruckFromShipment,
  getRecommendedTrucksForShipment,
  deleteShipment,
};