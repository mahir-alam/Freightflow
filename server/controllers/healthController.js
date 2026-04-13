const pool = require("../config/db");

const getHealthStatus = async (req, res) => {
  try {
    const dbResult = await pool.query("SELECT NOW() AS current_time");

    res.status(200).json({
      status: "ok",
      service: "FreightFlow API",
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: "connected",
        currentTime: dbResult.rows[0].current_time,
      },
    });
  } catch (error) {
    console.error("Health check failed:", error.message);

    res.status(500).json({
      status: "error",
      service: "FreightFlow API",
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: "disconnected",
      },
      error: "Database health check failed",
    });
  }
};

module.exports = {
  getHealthStatus,
};