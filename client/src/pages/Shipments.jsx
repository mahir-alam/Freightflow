import { useEffect, useState } from "react";
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

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("BDT");

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

  const formatCurrency = (amountInBdt) => {
    const convertedAmount = amountInBdt * currencyRates[currency];

    return `${currencySymbols[currency]}${convertedAmount.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700";
      case "Assigned":
        return "bg-blue-50 text-blue-700";
      case "In Transit":
        return "bg-purple-50 text-purple-700";
      case "Completed":
        return "bg-emerald-50 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Shipments</h1>
            <p className="mt-2 text-slate-600">
              Manage shipment requests, track routes, and review negotiated
              pricing across brokerage operations.
            </p>
          </div>

          <div className="w-full md:w-52">
            <label
              htmlFor="currency"
              className="mb-2 block text-sm font-medium text-slate-600"
            >
              Display Currency
            </label>
            <select
              id="currency"
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

                    <td className="px-6 py-4">{shipment.shipmentDate}</td>

                    <td className="px-6 py-4">{shipment.truckType}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                          shipment.status
                        )}`}
                      >
                        {shipment.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {formatCurrency(shipment.negotiatedPrice)}
                    </td>

                    <td className="px-6 py-4">
                      {formatCurrency(shipment.commissionAmount)}
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