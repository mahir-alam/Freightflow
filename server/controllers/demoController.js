const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const resetDemoData = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "demo_admin") {
      return res.status(403).json({
        error: "Demo reset is only available to the demo admin account",
      });
    }

    const seedFilePath = path.join(__dirname, "../../docs/freightflow_demo_seed.sql");
    const seedSql = fs.readFileSync(seedFilePath, "utf8");

    await pool.query(seedSql);

    return res.json({
      message: "Demo data has been reset successfully",
    });
  } catch (error) {
    console.error("Error resetting demo data:", error.message);
    return res.status(500).json({
      error: "Failed to reset demo data",
    });
  }
};

module.exports = {
  resetDemoData,
};