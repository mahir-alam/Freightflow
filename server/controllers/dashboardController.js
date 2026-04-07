const pool = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const totalShipmentsResult = await pool.query(
      `SELECT COUNT(*) AS count FROM shipments;`
    );

    const pendingShipmentsResult = await pool.query(
      `SELECT COUNT(*) AS count FROM shipments WHERE status = 'Pending';`
    );

    const activeShipmentsResult = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM shipments
      WHERE status IN ('Pending', 'Assigned', 'In Transit');
      `
    );

    const availableTrucksResult = await pool.query(
      `SELECT COUNT(*) AS count FROM trucks WHERE availability_status = 'Available';`
    );

    const totalRevenueResult = await pool.query(
      `SELECT COALESCE(SUM(negotiated_price_bdt), 0) AS total FROM shipments;`
    );

    res.json({
      totalShipments: Number(totalShipmentsResult.rows[0].count),
      pendingShipments: Number(pendingShipmentsResult.rows[0].count),
      activeShipments: Number(activeShipmentsResult.rows[0].count),
      availableTrucks: Number(availableTrucksResult.rows[0].count),
      totalRevenue: Number(totalRevenueResult.rows[0].total),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error.message);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

module.exports = {
  getDashboardStats,
};