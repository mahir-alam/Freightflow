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

const baseShipmentReturnFields = `
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
  client_user_id AS "clientUserId"
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
      RETURNING ${baseShipmentReturnFields};
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

const updateShipment = async (req, res) => {
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

    const existingShipment = await pool.query(
      `
      SELECT id
      FROM shipments
      WHERE id = $1
      `,
      [id]
    );

    if (existingShipment.rowCount === 0) {
      return res.status(404).json({ error: "Shipment not found" });
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
      RETURNING ${baseShipmentReturnFields};
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
    console.error("Error updating shipment:", error.message);
    res.status(500).json({ error: "Failed to update shipment" });
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
      RETURNING ${baseShipmentReturnFields};
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

    if (!["Pending", "Assigned"].includes(shipment.status)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Only pending or assigned shipments can be assigned or reassigned",
      });
    }

    if (shipment.assigned_truck_id) {
      await client.query(
        `
        UPDATE trucks
        SET availability_status = 'Available'
        WHERE id = $1
        `,
        [shipment.assigned_truck_id]
      );
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
      return res
        .status(400)
        .json({ error: "Shipment does not have an assigned truck" });
    }

    if (shipment.status !== "Assigned") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Only assigned shipments can have their truck unassigned",
      });
    }

    await client.query(
      `
      UPDATE trucks
      SET availability_status = 'Available'
      WHERE id = $1
      `,
      [shipment.assigned_truck_id]
    );

    await client.query(
      `
      UPDATE shipments
      SET assigned_truck_id = NULL,
          status = 'Pending'
      WHERE id = $1
      `,
      [id]
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
      SELECT id, truck_type, pickup_location, status
      FROM shipments
      WHERE id = $1
      `,
      [id]
    );

    if (shipmentResult.rowCount === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const shipment = shipmentResult.rows[0];

    if (!["Pending", "Assigned"].includes(shipment.status)) {
      return res.status(400).json({
        error: "Recommendations are only available for pending or assigned shipments",
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

const getRoutePricingInsights = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, truckType } = req.query;

    if (!pickupLocation || !dropoffLocation) {
      return res.status(400).json({
        error: "Pickup location and dropoff location are required",
      });
    }

    const exactMatchResult = await pool.query(
      `
      SELECT
        COUNT(*)::int AS "shipmentCount",
        COALESCE(AVG(negotiated_price_bdt), 0)::float AS "averagePrice",
        COALESCE(AVG(commission_amount_bdt), 0)::float AS "averageCommission",
        COALESCE(
          AVG(
            CASE
              WHEN negotiated_price_bdt > 0
              THEN (commission_amount_bdt / negotiated_price_bdt) * 100
              ELSE 0
            END
          ),
          0
        )::float AS "averageMarginPercent",
        COALESCE(MIN(negotiated_price_bdt), 0)::float AS "minObservedPrice",
        COALESCE(MAX(negotiated_price_bdt), 0)::float AS "maxObservedPrice"
      FROM shipments
      WHERE pickup_location = $1
        AND dropoff_location = $2
        AND ($3::text IS NULL OR truck_type = $3)
      `,
      [pickupLocation, dropoffLocation, truckType || null]
    );

    const routeOnlyResult = await pool.query(
      `
      SELECT
        COUNT(*)::int AS "shipmentCount",
        COALESCE(AVG(negotiated_price_bdt), 0)::float AS "averagePrice",
        COALESCE(AVG(commission_amount_bdt), 0)::float AS "averageCommission",
        COALESCE(
          AVG(
            CASE
              WHEN negotiated_price_bdt > 0
              THEN (commission_amount_bdt / negotiated_price_bdt) * 100
              ELSE 0
            END
          ),
          0
        )::float AS "averageMarginPercent"
      FROM shipments
      WHERE pickup_location = $1
        AND dropoff_location = $2
      `,
      [pickupLocation, dropoffLocation]
    );

    const exact = exactMatchResult.rows[0];
    const routeOnly = routeOnlyResult.rows[0];

    const hasExactMatch = Number(exact.shipmentCount) > 0;
    const selectedBenchmark = hasExactMatch ? exact : routeOnly;
    const selectedShipmentCount = Number(selectedBenchmark.shipmentCount || 0);
    const averagePrice = Number(selectedBenchmark.averagePrice || 0);
    const averageCommission = Number(selectedBenchmark.averageCommission || 0);
    const averageMarginPercent = Number(
      selectedBenchmark.averageMarginPercent || 0
    );

    const suggestedMinPrice = averagePrice > 0 ? averagePrice * 0.9 : 0;
    const suggestedMaxPrice = averagePrice > 0 ? averagePrice * 1.1 : 0;

    res.json({
      benchmarkType: hasExactMatch ? "exact_route_and_truck_type" : "route_only",
      shipmentCount: selectedShipmentCount,
      routeShipmentCount: Number(routeOnly.shipmentCount || 0),
      averagePrice,
      averageCommission,
      averageMarginPercent,
      minObservedPrice: Number(exact.minObservedPrice || 0),
      maxObservedPrice: Number(exact.maxObservedPrice || 0),
      suggestedMinPrice,
      suggestedMaxPrice,
      hasEnoughData: selectedShipmentCount >= 2,
    });
  } catch (error) {
    console.error("Error fetching route pricing insights:", error.message);
    res.status(500).json({ error: "Failed to fetch route pricing insights" });
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
  updateShipment,
  updateShipmentStatus,
  assignTruckToShipment,
  unassignTruckFromShipment,
  getRecommendedTrucksForShipment,
  getRoutePricingInsights,
  deleteShipment,
};