import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

const initialFormData = {
  truckCode: "",
  driverName: "",
  truckType: "",
  currentLocation: "",
  availabilityStatus: "Available",
  capacityTons: "",
};

const initialFilters = {
  search: "",
  availability: "All",
};

const availabilityOptions = ["Available", "Assigned", "Unavailable"];

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500";
const smallSelectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70";

const availabilityColors = {
  Available: "bg-emerald-50 text-emerald-700",
  Assigned: "bg-blue-50 text-blue-700",
  Unavailable: "bg-red-50 text-red-700",
};

const Card = ({ title, subtitle, right, children, className = "" }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
    {(title || subtitle || right) && (
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
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

const Field = ({ label, children }) => (
  <div>
    {label && <label className="mb-2 block text-sm font-medium text-slate-600">{label}</label>}
    {children}
  </div>
);

const Badge = ({ text, colorClass }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}>
    {text}
  </span>
);

export default function Trucks() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [filters, setFilters] = useState(initialFilters);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [updatingTruckId, setUpdatingTruckId] = useState(null);

  const fetchTrucks = async () => {
    try {
      const res = await api.get("/api/trucks");
      setTrucks(res.data);
    } catch (error) {
      console.error("Error fetching trucks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const filteredTrucks = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return trucks.filter((truck) => {
      const matchesSearch =
        !search ||
        truck.truckCode.toLowerCase().includes(search) ||
        truck.driverName.toLowerCase().includes(search) ||
        truck.truckType.toLowerCase().includes(search) ||
        truck.currentLocation.toLowerCase().includes(search);

      const matchesAvailability =
        filters.availability === "All" ||
        truck.availabilityStatus === filters.availability;

      return matchesSearch && matchesAvailability;
    });
  }, [trucks, filters]);

  const handleFormChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const clearFilters = () => setFilters(initialFilters);

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

  const handleAvailabilityChange = async (id, availabilityStatus) => {
    try {
      setUpdatingTruckId(id);
      await api.patch(`/api/trucks/${id}/availability`, { availabilityStatus });
      await fetchTrucks();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update truck availability");
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
            Manage external truck records, driver details, availability, and operational readiness.
          </p>
        </div>

        <Card
          title="Add Truck"
          subtitle="Register an external truck for brokerage assignment and availability tracking."
          className="mb-8"
        >
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input
              className={inputClass}
              name="truckCode"
              placeholder="Truck identifier (e.g., TRK-1001)"
              value={formData.truckCode}
              onChange={handleFormChange}
            />
            <input
              className={inputClass}
              name="driverName"
              placeholder="Driver name"
              value={formData.driverName}
              onChange={handleFormChange}
            />
            <input
              className={inputClass}
              name="truckType"
              placeholder="Truck type"
              value={formData.truckType}
              onChange={handleFormChange}
            />
            <input
              className={inputClass}
              name="currentLocation"
              placeholder="Current location"
              value={formData.currentLocation}
              onChange={handleFormChange}
            />
            <select
              className={inputClass}
              name="availabilityStatus"
              value={formData.availabilityStatus}
              onChange={handleFormChange}
            >
              {availabilityOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input
              className={inputClass}
              type="number"
              step="0.01"
              name="capacityTons"
              placeholder="Capacity (tons)"
              value={formData.capacityTons}
              onChange={handleFormChange}
            />

            <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-3 md:flex-row md:items-center md:justify-between">
              <p className={`text-sm ${formError ? "font-medium text-red-600" : "text-slate-500"}`}>
                {formError || "Keep truck identifiers unique so each external vehicle can be tracked clearly."}
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Adding..." : "Add Truck"}
              </button>
            </div>
          </form>
        </Card>

        <Card
          title="Search & Filters"
          subtitle="Search trucks and narrow the list by current availability."
          right={
            <div className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-800">{filteredTrucks.length}</span> of{" "}
              <span className="font-semibold text-slate-800">{trucks.length}</span> trucks
            </div>
          }
          className="mb-6"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Search Trucks">
              <input
                className={inputClass}
                name="search"
                placeholder="Search code, driver, type, or location"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </Field>

            <Field label="Availability">
              <select
                className={inputClass}
                name="availability"
                value={filters.availability}
                onChange={handleFilterChange}
              >
                <option value="All">All trucks</option>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </Field>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </Card>

        {loading ? (
          <p className="text-slate-600">Loading trucks...</p>
        ) : filteredTrucks.length === 0 ? (
          <Card>
            <div className="py-2 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                {trucks.length === 0 ? "No trucks found" : "No matching trucks"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {trucks.length === 0
                  ? "No truck records have been added yet."
                  : "Try adjusting your search or filter settings to see more results."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-6 py-3">Truck Identifier</th>
                  <th className="px-6 py-3">Driver</th>
                  <th className="px-6 py-3">Truck Type</th>
                  <th className="px-6 py-3">Current Location</th>
                  <th className="px-6 py-3">Availability</th>
                  <th className="px-6 py-3">Capacity (tons)</th>
                </tr>
              </thead>

              <tbody>
                {filteredTrucks.map((truck) => (
                  <tr key={truck.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 font-medium">{truck.truckCode}</td>
                    <td className="px-6 py-4">{truck.driverName}</td>
                    <td className="px-6 py-4">{truck.truckType}</td>
                    <td className="px-6 py-4">{truck.currentLocation}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          text={truck.availabilityStatus}
                          colorClass={availabilityColors[truck.availabilityStatus] || "bg-slate-100 text-slate-700"}
                        />
                        <select
                          value={truck.availabilityStatus}
                          onChange={(e) => handleAvailabilityChange(truck.id, e.target.value)}
                          disabled={updatingTruckId === truck.id}
                          className={smallSelectClass}
                        >
                          {availabilityOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
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