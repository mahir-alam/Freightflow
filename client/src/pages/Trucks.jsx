import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

const initialFormData = {
  truckNumber: "",
  driverName: "",
  truckType: "",
  currentLocation: "",
  availabilityStatus: "Available",
  capacityTons: "",
};

const availabilityOptions = ["Available", "Assigned", "Unavailable"];

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
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [updatingTruckId, setUpdatingTruckId] = useState(null);

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

  useEffect(() => {
    fetchTrucks();
  }, []);

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
      await api.post("/api/trucks", {
        ...formData,
        capacityTons: Number(formData.capacityTons),
      });

      setFormData(initialFormData);
      await fetchTrucks();
    } catch (error) {
      console.error("Error creating truck:", error);
      setFormError(error.response?.data?.error || "Failed to create truck");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvailabilityChange = async (id, newAvailability) => {
    try {
      setUpdatingTruckId(id);
      await api.patch(`/api/trucks/${id}/availability`, {
        availabilityStatus: newAvailability,
      });
      await fetchTrucks();
    } catch (error) {
      console.error("Error updating truck availability:", error);
      alert(
        error.response?.data?.error || "Failed to update truck availability"
      );
    } finally {
      setUpdatingTruckId(null);
    }
  };

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

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Add Truck</h2>
          <p className="mt-1 text-sm text-slate-500">
            Register an external truck for brokerage assignment and availability
            tracking.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            <input
              type="text"
              name="truckNumber"
              placeholder="Truck number"
              value={formData.truckNumber}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="text"
              name="driverName"
              placeholder="Driver name"
              value={formData.driverName}
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

            <input
              type="text"
              name="currentLocation"
              placeholder="Current location"
              value={formData.currentLocation}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <select
              name="availabilityStatus"
              value={formData.availabilityStatus}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              {availabilityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <input
              type="number"
              step="0.01"
              name="capacityTons"
              placeholder="Capacity (tons)"
              value={formData.capacityTons}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <div className="md:col-span-2 xl:col-span-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                {formError ? (
                  <p className="text-sm font-medium text-red-600">{formError}</p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Keep truck numbers unique so each external vehicle can be
                    tracked clearly.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Adding..." : "Add Truck"}
              </button>
            </div>
          </form>
        </section>

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
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getAvailabilityClasses(
                            truck.availabilityStatus
                          )}`}
                        >
                          {truck.availabilityStatus}
                        </span>

                        <select
                          value={truck.availabilityStatus}
                          onChange={(e) =>
                            handleAvailabilityChange(truck.id, e.target.value)
                          }
                          disabled={updatingTruckId === truck.id}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {availabilityOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
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