import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [message, setMessage] = useState("Checking server connection...");

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axios.get("http://localhost:5000");
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error fetching backend message:", error);
        setMessage("Backend connection failed");
      }
    };

    fetchMessage();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium tracking-wide text-blue-600">
              FreightFlow
            </p>
            <h1 className="text-2xl font-bold">Operations Dashboard</h1>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            Logistics Brokerage Platform
          </div>
        </div>
      </header>

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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active Shipments</p>
            <h3 className="mt-3 text-3xl font-bold">24</h3>
            <p className="mt-2 text-sm text-slate-500">
              Shipments currently being processed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Available Trucks</p>
            <h3 className="mt-3 text-3xl font-bold">12</h3>
            <p className="mt-2 text-sm text-slate-500">
              External trucks ready for assignment
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending Requests</p>
            <h3 className="mt-3 text-3xl font-bold">8</h3>
            <p className="mt-2 text-sm text-slate-500">
              Shipment requests awaiting admin action
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Today’s Revenue</p>
            <h3 className="mt-3 text-3xl font-bold">$4,850</h3>
            <p className="mt-2 text-sm text-slate-500">
              Estimated value from active brokerage deals
            </p>
          </div>
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