import { useEffect, useState } from "react";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import api from "../services/api";

export default function Dashboard() {
  const [message, setMessage] = useState("Checking server connection...");

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await api.get("/");
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error fetching backend message:", error);
        setMessage("Backend connection failed");
      }
    };

    fetchMessage();
  }, []);

  const stats = [
    {
      title: "Active Shipments",
      value: "24",
      description: "Shipments currently being processed",
    },
    {
      title: "Available Trucks",
      value: "12",
      description: "External trucks ready for assignment",
    },
    {
      title: "Pending Requests",
      value: "8",
      description: "Shipment requests awaiting admin action",
    },
    {
      title: "Today’s Revenue",
      value: "$4,850",
      description: "Estimated value from active brokerage deals",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Shipment operations overview
          </h2>
          <p className="mt-2 max-w-3xl text-slate-600">
            A data-driven logistics brokerage platform designed to manage
            shipment operations, truck assignments, negotiated pricing, and
            commission-based workflows.
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Operations Summary</h3>
                <p className="text-sm text-slate-500">
                  Live workflow visibility across shipments and assignments
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                System Active
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">
                  Shipment Workflow
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>• Pending review and negotiation</li>
                  <li>• Truck assignment coordination</li>
                  <li>• In-transit shipment monitoring</li>
                  <li>• Completion and commission tracking</li>
                </ul>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">
                  Planned Analytics
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>• Revenue and profit trends</li>
                  <li>• Route demand insights</li>
                  <li>• Truck utilization metrics</li>
                  <li>• Pricing and commission analysis</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Backend Status</p>
            <h3 className="mt-2 text-xl font-semibold">API Connection</h3>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Server Response</p>
              <p className="mt-2 text-base font-semibold text-slate-800">
                {message}
              </p>
            </div>

            <div className="mt-5">
              <p className="text-sm text-slate-500">Environment</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Local development
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}