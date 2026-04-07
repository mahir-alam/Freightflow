import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await api.get("/api/shipments");
        setShipments(response.data);
      } catch (error) {
        console.error("Error fetching shipments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Shipments</h1>

        {loading ? (
          <p className="text-slate-600">Loading shipments...</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Route</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Truck</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Commission</th>
                </tr>
              </thead>

              <tbody>
                {shipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className="border-t border-slate-200"
                  >
                    <td className="px-6 py-4 font-medium">
                      {shipment.clientName}
                    </td>

                    <td className="px-6 py-4">
                      {shipment.pickupLocation} → {shipment.dropoffLocation}
                    </td>

                    <td className="px-6 py-4">
                      {shipment.shipmentDate}
                    </td>

                    <td className="px-6 py-4">
                      {shipment.truckType}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {shipment.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      ৳{shipment.negotiatedPrice}
                    </td>

                    <td className="px-6 py-4">
                      ৳{shipment.commissionAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}