const pool = require("../config/db");

const getAnalyticsData = async (req, res) => {
  try {
    const shipmentStatusResult = await pool.query(`
      SELECT status, COUNT(*)::int AS count
      FROM shipments
      GROUP BY status
      ORDER BY status;
    `);

    const truckAvailabilityResult = await pool.query(`
      SELECT availability_status AS "availabilityStatus", COUNT(*)::int AS count
      FROM trucks
      GROUP BY availability_status
      ORDER BY availability_status;
    `);

    const revenueResult = await pool.query(`
      SELECT
        COALESCE(SUM(negotiated_price_bdt), 0)::float AS "totalRevenue",
        COALESCE(AVG(negotiated_price_bdt), 0)::float AS "averageShipmentValue",
        COALESCE(SUM(commission_amount_bdt), 0)::float AS "totalCommission"
      FROM shipments;
    `);

    res.json({
      shipmentStatusData: shipmentStatusResult.rows,
      truckAvailabilityData: truckAvailabilityResult.rows,
      revenueSummary: revenueResult.rows[0],
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error.message);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};

module.exports = {
  getAnalyticsData,
};