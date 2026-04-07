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
      ORDER BY shipment_date DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching shipments:", error.message);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
};

module.exports = {
  getAllShipments,
};