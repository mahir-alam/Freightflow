const pool = require("../config/db");
const path = require("path");
const { spawn } = require("child_process");

const runPythonAnalytics = (payload) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "..", "python", "advanced_analytics.py");

    const pythonProcess = spawn("python", [scriptPath]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(stderr || `Python analytics process exited with code ${code}`)
        );
      }

      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (error) {
        reject(new Error("Failed to parse Python analytics output"));
      }
    });

    pythonProcess.stdin.write(JSON.stringify(payload));
    pythonProcess.stdin.end();
  });
};

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
        COALESCE(SUM(commission_amount_bdt), 0)::float AS "totalCommission",
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
        )::float AS "averageCommissionRate"
      FROM shipments;
    `);

    const operationsSummaryResult = await pool.query(`
      SELECT
        COUNT(*)::int AS "totalShipments",
        COUNT(*) FILTER (WHERE status = 'Completed')::int AS "completedShipments",
        COUNT(*) FILTER (WHERE assigned_truck_id IS NOT NULL)::int AS "assignedShipments"
      FROM shipments;
    `);

    const fleetSummaryResult = await pool.query(`
      SELECT
        COUNT(*)::int AS "totalTrucks",
        COUNT(*) FILTER (WHERE availability_status = 'Assigned')::int AS "assignedTrucks",
        COUNT(*) FILTER (WHERE availability_status = 'Available')::int AS "availableTrucks"
      FROM trucks;
    `);

    const routeInsightsResult = await pool.query(`
      SELECT
        pickup_location AS "pickupLocation",
        dropoff_location AS "dropoffLocation",
        COUNT(*)::int AS "shipmentCount",
        COALESCE(AVG(negotiated_price_bdt), 0)::float AS "averagePrice",
        COALESCE(SUM(commission_amount_bdt), 0)::float AS "totalCommission"
      FROM shipments
      GROUP BY pickup_location, dropoff_location
      ORDER BY "shipmentCount" DESC, "averagePrice" DESC
      LIMIT 5;
    `);

    const pickupInsightsResult = await pool.query(`
      SELECT
        pickup_location AS name,
        COUNT(*)::int AS count
      FROM shipments
      GROUP BY pickup_location
      ORDER BY count DESC, name ASC
      LIMIT 5;
    `);

    const dropoffInsightsResult = await pool.query(`
      SELECT
        dropoff_location AS name,
        COUNT(*)::int AS count
      FROM shipments
      GROUP BY dropoff_location
      ORDER BY count DESC, name ASC
      LIMIT 5;
    `);

    const truckTypeInsightsResult = await pool.query(`
      SELECT
        truck_type AS "truckType",
        COUNT(*)::int AS count
      FROM shipments
      GROUP BY truck_type
      ORDER BY count DESC, "truckType" ASC;
    `);

    const monthlyRevenueResult = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', shipment_date), 'Mon YYYY') AS month,
        COALESCE(SUM(negotiated_price_bdt), 0)::float AS revenue,
        COALESCE(SUM(commission_amount_bdt), 0)::float AS commission
      FROM shipments
      GROUP BY DATE_TRUNC('month', shipment_date)
      ORDER BY DATE_TRUNC('month', shipment_date) ASC;
    `);

    const rawShipmentDataResult = await pool.query(`
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
        t.truck_number AS "assignedTruckCode"
      FROM shipments s
      LEFT JOIN trucks t ON s.assigned_truck_id = t.id
      ORDER BY s.shipment_date ASC, s.id ASC;
    `);

    const rawTruckDataResult = await pool.query(`
      SELECT
        id,
        truck_number AS "truckCode",
        driver_name AS "driverName",
        truck_type AS "truckType",
        current_location AS "currentLocation",
        availability_status AS "availabilityStatus",
        capacity_tons AS "capacityTons"
      FROM trucks
      ORDER BY id ASC;
    `);

    const revenueSummary = revenueResult.rows[0];
    const operationsSummary = operationsSummaryResult.rows[0];
    const fleetSummary = fleetSummaryResult.rows[0];

    const totalShipments = Number(operationsSummary.totalShipments || 0);
    const completedShipments = Number(operationsSummary.completedShipments || 0);
    const assignedShipments = Number(operationsSummary.assignedShipments || 0);

    const totalTrucks = Number(fleetSummary.totalTrucks || 0);
    const assignedTrucks = Number(fleetSummary.assignedTrucks || 0);

    const completionRate =
      totalShipments > 0 ? (completedShipments / totalShipments) * 100 : 0;

    const assignmentRate =
      totalShipments > 0 ? (assignedShipments / totalShipments) * 100 : 0;

    const truckUtilizationRate =
      totalTrucks > 0 ? (assignedTrucks / totalTrucks) * 100 : 0;

    let pandasInsights = {
      mostProfitableRoutes: [],
      lowestMarginRoutes: [],
      routeBenchmarks: [],
      monthlyShipmentTrend: [],
      truckTypeProfitability: [],
      summary: {
        averageMarginPercent: 0,
        highestMarginPercent: 0,
        lowestMarginPercent: 0,
      },
    };

    try {
      pandasInsights = await runPythonAnalytics({
        shipments: rawShipmentDataResult.rows,
        trucks: rawTruckDataResult.rows,
      });
    } catch (pythonError) {
      console.error("Python analytics failed:", pythonError.message);
    }

    res.json({
      shipmentStatusData: shipmentStatusResult.rows,
      truckAvailabilityData: truckAvailabilityResult.rows,
      revenueSummary,
      operationsSummary: {
        ...operationsSummary,
        completionRate,
        assignmentRate,
      },
      fleetSummary: {
        ...fleetSummary,
        truckUtilizationRate,
      },
      routeInsights: routeInsightsResult.rows,
      pickupInsights: pickupInsightsResult.rows,
      dropoffInsights: dropoffInsightsResult.rows,
      truckTypeInsights: truckTypeInsightsResult.rows,
      monthlyRevenueData: monthlyRevenueResult.rows,
      pandasInsights,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error.message);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};

module.exports = {
  getAnalyticsData,
};