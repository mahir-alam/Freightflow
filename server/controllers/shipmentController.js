const pool = require("../config/db");

const getAllShipments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        client_name AS "clientName",
        pickup_location AS "pickupLocation",
        dropoff_location AS "dropoffLocation",
        shipment_date AS "shipmentDate",
        truck_type AS "truckType",
        status,
        negotiated_price_bdt AS "negotiatedPrice",
        commission_amount_bdt AS "commissionAmount"
      FROM shipments
      ORDER BY shipment_date DESC, id DESC;
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
        commission_amount_bdt AS "commissionAmount";
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

module.exports = {
  getAllShipments,
  createShipment,
};