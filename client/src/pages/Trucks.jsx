import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

const getAvailabilityClasses = (status) => {
  switch (status) {
    case "Available":
      return "bg-emerald-50 text-emerald-700";
    case "Assigned":
      return "bg-blue-50 text-blue-700";
    case "Unavailable":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function Trucks() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const response = await api.get("/api/trucks");
        setTrucks(response.data);
      } catch (error) {
        console.error("Error fetching trucks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrucks();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Trucks</h1>
          <p className="mt-2 text-slate-600">
            Manage external truck records, driver details, availability, and
            operational readiness.
          </p>
        </div>

        {loading ? (
          <p className="text-slate-600">Loading trucks...</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-6 py-3">Truck Number</th>
                  <th className="px-6 py-3">Driver</th>
                  <th className="px-6 py-3">Truck Type</th>
                  <th className="px-6 py-3">Current Location</th>
                  <th className="px-6 py-3">Availability</th>
                  <th className="px-6 py-3">Capacity (tons)</th>
                </tr>
              </thead>

              <tbody>
                {trucks.map((truck) => (
                  <tr key={truck.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 font-medium">
                      {truck.truckNumber}
                    </td>
                    <td className="px-6 py-4">{truck.driverName}</td>
                    <td className="px-6 py-4">{truck.truckType}</td>
                    <td className="px-6 py-4">{truck.currentLocation}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getAvailabilityClasses(
                          truck.availabilityStatus
                        )}`}
                      >
                        {truck.availabilityStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">{truck.capacityTons}</td>
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