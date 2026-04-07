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

const initialFormData = {
  clientName: "",
  pickupLocation: "",
  dropoffLocation: "",
  shipmentDate: "",
  truckType: "",
  status: "Pending",
  negotiatedPrice: "",
  commissionAmount: "",
};

const statusOptions = ["Pending", "Assigned", "In Transit", "Completed"];

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("BDT");
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [assigningTruckId, setAssigningTruckId] = useState(null);

  const fetchShipments = async () => {
    const response = await api.get("/api/shipments");
    setShipments(response.data);
  };

  const fetchAvailableTrucks = async () => {
    const response = await api.get("/api/trucks");
    const onlyAvailable = response.data.filter(
      (truck) => truck.availabilityStatus === "Available"
    );
    setAvailableTrucks(onlyAvailable);
  };

  const loadPageData = async () => {
    try {
      await Promise.all([fetchShipments(), fetchAvailableTrucks()]);
    } catch (error) {
      console.error("Error loading shipments page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const formatCurrency = (amountInBdt) => {
    const convertedAmount = Number(amountInBdt) * currencyRates[currency];

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      await api.post("/api/shipments", {
        ...formData,
        negotiatedPrice: Number(formData.negotiatedPrice),
        commissionAmount: Number(formData.commissionAmount),
      });

      setFormData(initialFormData);
      await loadPageData();
    } catch (error) {
      console.error("Error creating shipment:", error);
      setFormError(
        error.response?.data?.error || "Failed to create shipment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingStatusId(id);
      await api.patch(`/api/shipments/${id}/status`, { status: newStatus });
      await loadPageData();
    } catch (error) {
      console.error("Error updating shipment status:", error);
      alert(error.response?.data?.error || "Failed to update shipment status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleAssignTruck = async (shipmentId, truckId) => {
    if (!truckId) return;

    try {
      setAssigningTruckId(shipmentId);
      await api.patch(`/api/shipments/${shipmentId}/assign-truck`, {
        truckId: Number(truckId),
      });
      await loadPageData();
    } catch (error) {
      console.error("Error assigning truck:", error);
      alert(error.response?.data?.error || "Failed to assign truck");
    } finally {
      setAssigningTruckId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this shipment?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      await api.delete(`/api/shipments/${id}`);
      await loadPageData();
    } catch (error) {
      console.error("Error deleting shipment:", error);
      alert(error.response?.data?.error || "Failed to delete shipment");
    } finally {
      setDeletingId(null);
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
              Manage shipment requests, track routes, assign trucks, and review
              negotiated pricing across brokerage operations.
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

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Create Shipment</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add a new shipment request into the brokerage workflow.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <input
              type="text"
              name="clientName"
              placeholder="Client name"
              value={formData.clientName}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="text"
              name="pickupLocation"
              placeholder="Pickup location"
              value={formData.pickupLocation}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="text"
              name="dropoffLocation"
              placeholder="Dropoff location"
              value={formData.dropoffLocation}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="date"
              name="shipmentDate"
              value={formData.shipmentDate}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="text"
              name="truckType"
              placeholder="Truck type"
              value={formData.truckType}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              {statusOptions.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="negotiatedPrice"
              placeholder="Negotiated price (BDT)"
              value={formData.negotiatedPrice}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="number"
              name="commissionAmount"
              placeholder="Commission amount (BDT)"
              value={formData.commissionAmount}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <div className="md:col-span-2 xl:col-span-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                {formError ? (
                  <p className="text-sm font-medium text-red-600">{formError}</p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Prices are stored in BDT and displayed in your selected
                    currency.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Creating..." : "Create Shipment"}
              </button>
            </div>
          </form>
        </section>

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
                  <th className="px-6 py-3">Truck Type</th>
                  <th className="px-6 py-3">Assigned Truck</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Commission</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 font-medium">
                      {shipment.clientName}
                    </td>

                    <td className="px-6 py-4">
                      {shipment.pickupLocation} → {shipment.dropoffLocation}
                    </td>

                    <td className="px-6 py-4">{shipment.shipmentDate}</td>

                    <td className="px-6 py-4">{shipment.truckType}</td>

                    <td className="px-6 py-4">
                      {shipment.assignedTruckCode ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {shipment.assignedTruckCode}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue=""
                            onChange={(e) =>
                              handleAssignTruck(shipment.id, e.target.value)
                            }
                            disabled={assigningTruckId === shipment.id}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <option value="">Assign truck</option>
                            {availableTrucks.map((truck) => (
                              <option key={truck.id} value={truck.id}>
                                {truck.truckCode}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                            shipment.status
                          )}`}
                        >
                          {shipment.status}
                        </span>

                        <select
                          value={shipment.status}
                          onChange={(e) =>
                            handleStatusChange(shipment.id, e.target.value)
                          }
                          disabled={updatingStatusId === shipment.id}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {statusOptions.map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {statusOption}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {formatCurrency(shipment.negotiatedPrice)}
                    </td>

                    <td className="px-6 py-4">
                      {formatCurrency(shipment.commissionAmount)}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(shipment.id)}
                        disabled={deletingId === shipment.id}
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {deletingId === shipment.id ? "Deleting..." : "Delete"}
                      </button>
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