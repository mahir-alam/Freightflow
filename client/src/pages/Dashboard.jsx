import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";

const currencyRates = {
  BDT: 1,
  USD: 1 / 110,
  CAD: 1 / 81,
};

const currencySymbols = {
  BDT: "৳",
  USD: "$",
  CAD: "C$",
};

const Card = ({ title, subtitle, right, children, className = "" }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
    {(title || subtitle || right) && (
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

const MetricCard = ({ title, value, description }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
  </div>
);

const StatusBadge = ({ text, variant = "default" }) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-700",
    Assigned: "bg-blue-50 text-blue-700",
    "In Transit": "bg-purple-50 text-purple-700",
    Completed: "bg-emerald-50 text-emerald-700",
    Available: "bg-emerald-50 text-emerald-700",
    Unavailable: "bg-red-50 text-red-700",
    default: "bg-slate-100 text-slate-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[variant] || styles.default}`}>
      {text}
    </span>
  );
};

export default function Dashboard() {
  const [currency, setCurrency] = useState("BDT");
  const [shipments, setShipments] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amountInBdt) => {
    const convertedAmount = Number(amountInBdt || 0) * currencyRates[currency];

    return `${currencySymbols[currency]}${convertedAmount.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [shipmentsRes, trucksRes, analyticsRes] = await Promise.all([
          api.get("/api/shipments"),
          api.get("/api/trucks"),
          api.get("/api/analytics"),
        ]);

        setShipments(shipmentsRes.data || []);
        setTrucks(trucksRes.data || []);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const recentShipments = useMemo(() => {
    return [...shipments].slice(0, 5);
  }, [shipments]);

  const recentAvailableTrucks = useMemo(() => {
    return trucks.filter((truck) => truck.availabilityStatus === "Available").slice(0, 5);
  }, [trucks]);

  const dashboardStats = useMemo(() => {
    const totalShipments = shipments.length;
    const pendingShipments = shipments.filter((shipment) => shipment.status === "Pending").length;
    const inTransitShipments = shipments.filter(
      (shipment) => shipment.status === "In Transit"
    ).length;
    const totalRevenue = shipments.reduce(
      (sum, shipment) => sum + Number(shipment.negotiatedPrice || 0),
      0
    );
    const totalCommission = shipments.reduce(
      (sum, shipment) => sum + Number(shipment.commissionAmount || 0),
      0
    );

    return {
      totalShipments,
      pendingShipments,
      inTransitShipments,
      totalRevenue,
      totalCommission,
    };
  }, [shipments]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Operations Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Monitor brokerage activity, shipment workflow, truck readiness, and business performance in one place.
            </p>
          </div>

          <div className="w-full md:w-52">
            <label
              htmlFor="dashboardCurrency"
              className="mb-2 block text-sm font-medium text-slate-600"
            >
              Display Currency
            </label>
            <select
              id="dashboardCurrency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm outline-none focus:border-blue-500"
            >
              <option value="BDT">BDT</option>
              <option value="CAD">CAD</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-600">Loading dashboard...</p>
        ) : (
          <>
            <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                title="Total Shipments"
                value={dashboardStats.totalShipments}
                description="All shipment records tracked in the platform"
              />
              <MetricCard
                title="Pending Shipments"
                value={dashboardStats.pendingShipments}
                description="Requests waiting for assignment or action"
              />
              <MetricCard
                title="In Transit"
                value={dashboardStats.inTransitShipments}
                description="Shipments currently moving through delivery"
              />
              <MetricCard
                title="Revenue"
                value={formatCurrency(dashboardStats.totalRevenue)}
                description="Total negotiated shipment value"
              />
              <MetricCard
                title="Commission"
                value={formatCurrency(dashboardStats.totalCommission)}
                description="Total brokerage earnings tracked"
              />
            </section>

            <section className="mb-8 grid gap-6 xl:grid-cols-3">
              <Card
                title="Quick Actions"
                subtitle="Jump straight into operational workflows"
              >
                <div className="grid gap-3">
                  <Link
                    to="/shipments"
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Manage Shipments
                  </Link>
                  <Link
                    to="/trucks"
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Manage Trucks
                  </Link>
                  <Link
                    to="/analytics"
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View Full Analytics
                  </Link>
                </div>
              </Card>

              <Card
                title="Platform Health"
                subtitle="High-level operational snapshot"
                className="xl:col-span-2"
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Completion Rate</p>
                    <p className="mt-2 text-2xl font-bold">
                      {analytics ? `${Number(analytics.operationsSummary.completionRate).toFixed(1)}%` : "0.0%"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Assignment Rate</p>
                    <p className="mt-2 text-2xl font-bold">
                      {analytics ? `${Number(analytics.operationsSummary.assignmentRate).toFixed(1)}%` : "0.0%"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Truck Utilization</p>
                    <p className="mt-2 text-2xl font-bold">
                      {analytics ? `${Number(analytics.fleetSummary.truckUtilizationRate).toFixed(1)}%` : "0.0%"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Avg Commission Rate</p>
                    <p className="mt-2 text-2xl font-bold">
                      {analytics ? `${Number(analytics.revenueSummary.averageCommissionRate).toFixed(1)}%` : "0.0%"}
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            <section className="mb-8 grid gap-6 xl:grid-cols-2">
              <Card
                title="Recent Shipments"
                subtitle="Latest shipment activity across the platform"
              >
                {recentShipments.length === 0 ? (
                  <p className="text-sm text-slate-500">No shipments available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentShipments.map((shipment) => (
                      <div
                        key={shipment.id}
                        className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{shipment.clientName}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {shipment.pickupLocation} → {shipment.dropoffLocation}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {shipment.shipmentDate} • {shipment.truckType}
                          </p>
                        </div>

                        <div className="flex flex-col items-start gap-2 md:items-end">
                          <StatusBadge text={shipment.status} variant={shipment.status} />
                          <p className="text-sm font-semibold text-slate-800">
                            {formatCurrency(shipment.negotiatedPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card
                title="Available Trucks"
                subtitle="Quick view of trucks currently ready for assignment"
              >
                {recentAvailableTrucks.length === 0 ? (
                  <p className="text-sm text-slate-500">No available trucks right now.</p>
                ) : (
                  <div className="space-y-3">
                    {recentAvailableTrucks.map((truck) => (
                      <div
                        key={truck.id}
                        className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{truck.truckCode}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {truck.driverName} • {truck.truckType}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {truck.currentLocation} • {truck.capacityTons} tons
                          </p>
                        </div>

                        <StatusBadge
                          text={truck.availabilityStatus}
                          variant={truck.availabilityStatus}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <Card
                title="Top Routes"
                subtitle="Highest shipment routes by activity"
              >
                {!analytics || analytics.routeInsights.length === 0 ? (
                  <p className="text-sm text-slate-500">No route insights available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.routeInsights.slice(0, 5).map((route, index) => (
                      <div
                        key={`${route.pickupLocation}-${route.dropoffLocation}-${index}`}
                        className="rounded-xl bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {route.pickupLocation} → {route.dropoffLocation}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {route.shipmentCount} shipments
                            </p>
                          </div>

                          <div className="text-sm text-slate-600">
                            Avg price:{" "}
                            <span className="font-semibold text-slate-900">
                              {formatCurrency(route.averagePrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card
                title="Business Snapshot"
                subtitle="High-value summary for demo and recruiter view"
              >
                {!analytics ? (
                  <p className="text-sm text-slate-500">No analytics summary available yet.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-500">Average Shipment Value</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {formatCurrency(analytics.revenueSummary.averageShipmentValue)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-500">Average Commission</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {formatCurrency(analytics.revenueSummary.averageCommission)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-500">Available Trucks</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {analytics.fleetSummary.availableTrucks}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}