const pool = require("../config/db");

const getHealthStatus = async (req, res) => {
  try {
    const dbResult = await pool.query("SELECT NOW()");
    
    res.json({
      message: "FreightFlow API is running",
      database: "connected",
      currentTime: dbResult.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      message: "FreightFlow API is running",
      database: "not connected",
      error: error.message,
    });
  }
};

module.exports = {
  getHealthStatus,
};