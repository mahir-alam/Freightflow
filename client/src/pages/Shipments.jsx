import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

const currencyRates = { BDT: 1, USD: 1 / 110, CAD: 1 / 81 };
const currencySymbols = { BDT: "৳", USD: "$", CAD: "C$" };

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500";
const smallSelectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70";

const statusColors = {
  Pending: "bg-amber-50 text-amber-700",
  Assigned: "bg-blue-50 text-blue-700",
  "In Transit": "bg-purple-50 text-purple-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

const recommendationColors = {
  "Best match": "bg-emerald-50 text-emerald-700",
  "Type match": "bg-blue-50 text-blue-700",
  "Location match": "bg-amber-50 text-amber-700",
  "Available fallback": "bg-slate-100 text-slate-700",
};

const initialFormData = {
  clientName: "",
  pickupLocation: "",
  dropoffLocation: "",
  shipmentDate: "",
  truckType: "",
  negotiatedPrice: "",
  commissionAmount: "",
};

const initialFilters = {
  search: "",
  status: "All",
  assignment: "All",
};

const getNextStatusOptions = (status) => {
  if (status === "Pending") return ["Pending", "Assigned"];
  if (status === "Assigned") return ["Assigned", "In Transit"];
  if (status === "In Transit") return ["In Transit", "Completed"];
  return ["Completed"];
};

const getRecommendationLabel = (truck, shipment) => {
  if (
    truck.truckType === shipment.truckType &&
    truck.currentLocation === shipment.pickupLocation
  ) {
    return "Best match";
  }
  if (truck.truckType === shipment.truckType) return "Type match";
  if (truck.currentLocation === shipment.pickupLocation) return "Location match";
  return "Available fallback";
};

const getPricePosition = (price, min, max) => {
  const numericPrice = Number(price || 0);
  if (!numericPrice || !min || !max) return null;
  if (numericPrice < min) return "below";
  if (numericPrice > max) return "above";
  return "within";
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

const ModalShell = ({ isOpen, title, subtitle, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

function RoutePricingInsights({ isAdmin, formData, currency, formatCurrency }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      !isAdmin ||
      !formData.pickupLocation.trim() ||
      !formData.dropoffLocation.trim()
    ) {
      setInsights(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/shipments/route-pricing-insights", {
          params: {
            pickupLocation: formData.pickupLocation.trim(),
            dropoffLocation: formData.dropoffLocation.trim(),
            truckType: formData.truckType.trim() || undefined,
          },
        });
        setInsights(response.data);
      } catch (error) {
        console.error("Error loading route pricing insights:", error);
        setInsights(null);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [isAdmin, formData.pickupLocation, formData.dropoffLocation, formData.truckType]);

  if (!isAdmin) return null;

  const pricePosition = insights
    ? getPricePosition(
        formData.negotiatedPrice,
        insights.suggestedMinPrice,
        insights.suggestedMaxPrice
      )
    : null;

  const positionText = {
    below: "Below suggested range",
    within: "Within suggested range",
    above: "Above suggested range",
  };

  const positionColor = {
    below: "bg-red-50 text-red-700",
    within: "bg-emerald-50 text-emerald-700",
    above: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 md:col-span-2 xl:col-span-4">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 className="text-base font-semibold text-slate-900">Route Pricing Insights</h4>
          <p className="mt-1 text-sm text-slate-500">
            Benchmark this shipment against similar historic routes before saving.
          </p>
        </div>
        {loading && <span className="text-sm text-slate-500">Loading insights...</span>}
      </div>

      {!formData.pickupLocation.trim() || !formData.dropoffLocation.trim() ? (
        <p className="text-sm text-slate-500">
          Enter pickup and dropoff locations to load pricing intelligence.
        </p>
      ) : !insights ? (
        <p className="text-sm text-slate-500">
          No benchmark data available yet for this route.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Benchmark Type</p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {insights.benchmarkType === "exact_route_and_truck_type"
                ? "Exact route + truck type"
                : "Route-level fallback"}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Comparable Shipments</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{insights.shipmentCount}</p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Historic Avg Price</p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {formatCurrency(insights.averagePrice)}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Historic Avg Margin</p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {Number(insights.averageMarginPercent).toFixed(1)}%
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm md:col-span-2">
            <p className="text-sm font-medium text-slate-500">Suggested Price Band</p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {formatCurrency(insights.suggestedMinPrice)} — {formatCurrency(insights.suggestedMaxPrice)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Based on historic averages with a ±10% guidance range
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm md:col-span-2">
            <p className="text-sm font-medium text-slate-500">Commission Benchmark</p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              Avg commission {formatCurrency(insights.averageCommission)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Use this to sanity-check your expected brokerage return
            </p>
          </div>

          {pricePosition && (
            <div className="md:col-span-2 xl:col-span-4">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${positionColor[pricePosition]}`}
              >
                {positionText[pricePosition]}
              </span>
            </div>
          )}

          {formData.negotiatedPrice &&
            formData.commissionAmount &&
            Number(formData.negotiatedPrice) > 0 && (
              <div className="rounded-xl bg-white p-4 shadow-sm md:col-span-2 xl:col-span-4">
                <p className="text-sm font-medium text-slate-500">Current Entered Margin</p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {(
                    (Number(formData.commissionAmount) / Number(formData.negotiatedPrice)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Compare this against the historic route margin before finalizing pricing
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

const ShipmentFormModal = ({
  isOpen,
  mode,
  formData,
  onChange,
  onClose,
  onSubmit,
  submitting,
  error,
  isAdmin,
  currency,
  formatCurrency,
}) => (
  <ModalShell
    isOpen={isOpen}
    title={mode === "edit" ? "Edit Shipment" : "Create Shipment"}
    subtitle={
      mode === "edit"
        ? "Update shipment details and use route benchmarks to validate pricing."
        : "Create a new shipment request. New shipments start as Pending."
    }
    onClose={onClose}
  >
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <input className={inputClass} name="clientName" placeholder="Client name" value={formData.clientName} onChange={onChange} />
      <input className={inputClass} name="pickupLocation" placeholder="Pickup location" value={formData.pickupLocation} onChange={onChange} />
      <input className={inputClass} name="dropoffLocation" placeholder="Dropoff location" value={formData.dropoffLocation} onChange={onChange} />
      <input className={inputClass} type="date" name="shipmentDate" value={formData.shipmentDate} onChange={onChange} />
      <input className={inputClass} name="truckType" placeholder="Truck type" value={formData.truckType} onChange={onChange} />
      <input className={inputClass} type="number" name="negotiatedPrice" placeholder="Negotiated price (BDT)" value={formData.negotiatedPrice} onChange={onChange} />
      <input className={inputClass} type="number" name="commissionAmount" placeholder="Commission amount (BDT)" value={formData.commissionAmount} onChange={onChange} />

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Workflow Start
        </p>
        <p className="mt-1 text-sm font-semibold text-amber-700">
          {mode === "edit" ? "Status managed separately" : "Pending"}
        </p>
      </div>

      <RoutePricingInsights
        isAdmin={isAdmin}
        formData={formData}
        currency={currency}
        formatCurrency={formatCurrency}
      />

      <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-4 md:flex-row md:items-center md:justify-between">
        <p className={`text-sm ${error ? "font-medium text-red-600" : "text-slate-500"}`}>
          {error || "Prices are stored in BDT and shown in your selected currency."}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Shipment"}
          </button>
        </div>
      </div>
    </form>
  </ModalShell>
);

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText,
  loading,
  onClose,
  onConfirm,
}) => (
  <ModalShell isOpen={isOpen} title={title} subtitle={message} onClose={onClose}>
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Processing..." : confirmText}
      </button>
    </div>
  </ModalShell>
);

export default function Shipments() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === "admin";

  const [shipments, setShipments] = useState([]);
  const [recommendedTrucksByShipment, setRecommendedTrucksByShipment] = useState({});
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("BDT");
  const [filters, setFilters] = useState(initialFilters);

  const [shipmentForm, setShipmentForm] = useState(initialFormData);
  const [modalMode, setModalMode] = useState("create");
  const [editingShipmentId, setEditingShipmentId] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [deletingShipment, setDeletingShipment] = useState(null);
  const [unassigningShipment, setUnassigningShipment] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [unassigningId, setUnassigningId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [assigningTruckId, setAssigningTruckId] = useState(null);

  const formatCurrency = (amount) => {
    const converted = Number(amount || 0) * currencyRates[currency];
    return `${currencySymbols[currency]}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const fetchShipments = async () => {
    const response = await api.get("/api/shipments");
    setShipments(response.data);
    return response.data;
  };

  const fetchRecommendations = async (shipmentList) => {
    if (!isAdmin) {
      setRecommendedTrucksByShipment({});
      return;
    }

    const eligible = shipmentList.filter(
      (shipment) => shipment.status === "Pending" || shipment.status === "Assigned"
    );

    const results = await Promise.all(
      eligible.map(async (shipment) => {
        try {
          const response = await api.get(`/api/shipments/${shipment.id}/recommend-trucks`);
          return [shipment.id, response.data];
        } catch {
          return [shipment.id, []];
        }
      })
    );

    setRecommendedTrucksByShipment(Object.fromEntries(results));
  };

  const loadPageData = async () => {
    try {
      const shipmentList = await fetchShipments();
      await fetchRecommendations(shipmentList);
    } catch (error) {
      console.error("Error loading shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const search = filters.search.trim().toLowerCase();
      const matchesSearch = !search || shipment.clientName.toLowerCase().includes(search);
      const matchesStatus = filters.status === "All" || shipment.status === filters.status;
      const matchesAssignment =
        filters.assignment === "All" ||
        (filters.assignment === "Assigned" && shipment.assignedTruckCode) ||
        (filters.assignment === "Unassigned" && !shipment.assignedTruckCode);

      return matchesSearch && matchesStatus && matchesAssignment;
    });
  }, [shipments, filters]);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingShipmentId(null);
    setShipmentForm(initialFormData);
    setFormError("");
    setIsFormModalOpen(true);
  };

  const openEditModal = (shipment) => {
    setModalMode("edit");
    setEditingShipmentId(shipment.id);
    setShipmentForm({
      clientName: shipment.clientName,
      pickupLocation: shipment.pickupLocation,
      dropoffLocation: shipment.dropoffLocation,
      shipmentDate: shipment.shipmentDate,
      truckType: shipment.truckType,
      negotiatedPrice: shipment.negotiatedPrice,
      commissionAmount: shipment.commissionAmount,
    });
    setFormError("");
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setShipmentForm(initialFormData);
    setEditingShipmentId(null);
    setFormError("");
  };

  const handleShipmentFormChange = (e) => {
    setShipmentForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const clearFilters = () => setFilters(initialFilters);

  const handleShipmentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      const payload = {
        ...shipmentForm,
        status: "Pending",
        negotiatedPrice: Number(shipmentForm.negotiatedPrice),
        commissionAmount: Number(shipmentForm.commissionAmount),
      };

      if (modalMode === "edit" && editingShipmentId) {
        await api.put(`/api/shipments/${editingShipmentId}`, payload);
      } else {
        await api.post("/api/shipments", payload);
      }

      closeFormModal();
      await loadPageData();
    } catch (error) {
      console.error("Error saving shipment:", error);
      setFormError(error.response?.data?.error || "Failed to save shipment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, nextStatus, currentStatus) => {
    if (!isAdmin || nextStatus === currentStatus) return;

    try {
      setUpdatingStatusId(id);
      await api.patch(`/api/shipments/${id}/status`, { status: nextStatus });
      await loadPageData();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update shipment status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleAssignTruck = async (shipmentId, truckId) => {
    if (!isAdmin || !truckId) return;

    try {
      setAssigningTruckId(shipmentId);
      await api.patch(`/api/shipments/${shipmentId}/assign-truck`, {
        truckId: Number(truckId),
      });
      await loadPageData();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to assign or reassign truck");
    } finally {
      setAssigningTruckId(null);
    }
  };

  const confirmDeleteShipment = async () => {
    if (!deletingShipment) return;

    try {
      setDeletingId(deletingShipment.id);
      await api.delete(`/api/shipments/${deletingShipment.id}`);
      setDeletingShipment(null);
      await loadPageData();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete shipment");
    } finally {
      setDeletingId(null);
    }
  };

  const confirmUnassignShipment = async () => {
    if (!unassigningShipment) return;

    try {
      setUnassigningId(unassigningShipment.id);
      await api.patch(`/api/shipments/${unassigningShipment.id}/unassign-truck`);
      setUnassigningShipment(null);
      await loadPageData();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to unassign truck");
    } finally {
      setUnassigningId(null);
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
              {isAdmin
                ? "Manage shipment requests, truck assignments, route pricing decisions, and workflow updates."
                : "Create shipment requests and track the progress of your logistics workflow."}
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <Field label="Display Currency">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="min-w-[180px] rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm outline-none focus:border-blue-500"
              >
                <option value="BDT">BDT</option>
                <option value="CAD">CAD</option>
                <option value="USD">USD</option>
              </select>
            </Field>

            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create Shipment
            </button>
          </div>
        </div>

        <Card
          title="Search & Filters"
          subtitle="Narrow down shipments by client, workflow status, or assignment state."
          right={
            <div className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-800">{filteredShipments.length}</span> of{" "}
              <span className="font-semibold text-slate-800">{shipments.length}</span> shipments
            </div>
          }
          className="mb-6"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Search by Client">
              <input
                className={inputClass}
                name="search"
                placeholder="Search client name"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </Field>

            <Field label="Status">
              <select className={inputClass} name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Transit">In Transit</option>
                <option value="Completed">Completed</option>
              </select>
            </Field>

            <Field label="Assignment">
              <select className={inputClass} name="assignment" value={filters.assignment} onChange={handleFilterChange}>
                <option value="All">All shipments</option>
                <option value="Assigned">Assigned only</option>
                <option value="Unassigned">Unassigned only</option>
              </select>
            </Field>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </Card>

        {loading ? (
          <p className="text-slate-600">Loading shipments...</p>
        ) : filteredShipments.length === 0 ? (
          <Card>
            <div className="py-2 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                {shipments.length === 0 ? "No shipments found" : "No matching shipments"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {shipments.length === 0
                  ? isAdmin
                    ? "No shipment requests have been created yet."
                    : "You have not created any shipment requests yet."
                  : "Try adjusting your search or filter settings to see more results."}
              </p>
            </div>
          </Card>
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
                  {isAdmin && <th className="px-6 py-3">Recommended Trucks</th>}
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Commission</th>
                  {isAdmin && <th className="px-6 py-3">Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredShipments.map((shipment) => {
                  const recommendedTrucks = recommendedTrucksByShipment[shipment.id] || [];
                  const canShowRecommendations =
                    shipment.status === "Pending" || shipment.status === "Assigned";

                  return (
                    <tr key={shipment.id} className="border-t border-slate-200 align-top">
                      <td className="px-6 py-4 font-medium">{shipment.clientName}</td>
                      <td className="px-6 py-4">
                        {shipment.pickupLocation} → {shipment.dropoffLocation}
                      </td>
                      <td className="px-6 py-4">{shipment.shipmentDate}</td>
                      <td className="px-6 py-4">{shipment.truckType}</td>

                      <td className="px-6 py-4">
                        {shipment.assignedTruckCode ? (
                          <Badge text={shipment.assignedTruckCode} colorClass="bg-slate-100 text-slate-700" />
                        ) : isAdmin && shipment.status === "Pending" ? (
                          <select
                            defaultValue=""
                            onChange={(e) => handleAssignTruck(shipment.id, e.target.value)}
                            disabled={assigningTruckId === shipment.id}
                            className={smallSelectClass}
                          >
                            <option value="">Assign truck</option>
                            {recommendedTrucks.map((truck) => (
                              <option key={truck.id} value={truck.id}>
                                {truck.truckCode}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-slate-400">Not assigned</span>
                        )}
                      </td>

                      {isAdmin && (
                        <td className="px-6 py-4">
                          {canShowRecommendations ? (
                            recommendedTrucks.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                {recommendedTrucks.slice(0, 3).map((truck) => {
                                  const label = getRecommendationLabel(truck, shipment);
                                  return (
                                    <div key={truck.id} className="rounded-xl bg-slate-50 p-3">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-slate-800">
                                          {truck.truckCode}
                                        </span>
                                        <span
                                          className={`rounded-full px-2 py-1 text-[10px] font-medium ${recommendationColors[label]}`}
                                        >
                                          {label}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-[11px] text-slate-500">
                                        {truck.truckType} • {truck.currentLocation}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                No available recommendations
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-slate-400">Not needed</span>
                          )}
                        </td>
                      )}

                      <td className="px-6 py-4">
                        {isAdmin ? (
                          <div className="flex items-center gap-2">
                            <Badge
                              text={shipment.status}
                              colorClass={statusColors[shipment.status] || "bg-slate-100 text-slate-700"}
                            />
                            <select
                              value={shipment.status}
                              onChange={(e) =>
                                handleStatusChange(shipment.id, e.target.value, shipment.status)
                              }
                              disabled={updatingStatusId === shipment.id || shipment.status === "Completed"}
                              className={smallSelectClass}
                            >
                              {getNextStatusOptions(shipment.status).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <Badge
                            text={shipment.status}
                            colorClass={statusColors[shipment.status] || "bg-slate-100 text-slate-700"}
                          />
                        )}
                      </td>

                      <td className="px-6 py-4">{formatCurrency(shipment.negotiatedPrice)}</td>
                      <td className="px-6 py-4">{formatCurrency(shipment.commissionAmount)}</td>

                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openEditModal(shipment)}
                              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                            >
                              Edit
                            </button>

                            {shipment.assignedTruckCode && shipment.status === "Assigned" && (
                              <button
                                onClick={() => setUnassigningShipment(shipment)}
                                className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                              >
                                Unassign
                              </button>
                            )}

                            {canShowRecommendations && recommendedTrucks.length > 0 && (
                              <select
                                defaultValue=""
                                onChange={(e) => handleAssignTruck(shipment.id, e.target.value)}
                                disabled={assigningTruckId === shipment.id}
                                className={smallSelectClass}
                              >
                                <option value="">
                                  {shipment.assignedTruckCode ? "Reassign truck" : "Assign truck"}
                                </option>
                                {recommendedTrucks.map((truck) => (
                                  <option key={truck.id} value={truck.id}>
                                    {truck.truckCode}
                                  </option>
                                ))}
                              </select>
                            )}

                            <button
                              onClick={() => setDeletingShipment(shipment)}
                              disabled={deletingId === shipment.id}
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {deletingId === shipment.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <ShipmentFormModal
          isOpen={isFormModalOpen}
          mode={modalMode}
          formData={shipmentForm}
          onChange={handleShipmentFormChange}
          onClose={closeFormModal}
          onSubmit={handleShipmentSubmit}
          submitting={submitting}
          error={formError}
          isAdmin={isAdmin}
          currency={currency}
          formatCurrency={formatCurrency}
        />

        <ConfirmModal
          isOpen={Boolean(deletingShipment)}
          title="Delete Shipment"
          message={
            deletingShipment
              ? `Delete shipment for ${deletingShipment.clientName}? This action cannot be undone.`
              : ""
          }
          confirmText="Delete Shipment"
          loading={Boolean(deletingShipment && deletingId === deletingShipment.id)}
          onClose={() => setDeletingShipment(null)}
          onConfirm={confirmDeleteShipment}
        />

        <ConfirmModal
          isOpen={Boolean(unassigningShipment)}
          title="Unassign Truck"
          message={
            unassigningShipment
              ? `Unassign truck ${unassigningShipment.assignedTruckCode} from this shipment? The shipment will move back to Pending.`
              : ""
          }
          confirmText="Unassign Truck"
          loading={Boolean(unassigningShipment && unassigningId === unassigningShipment.id)}
          onClose={() => setUnassigningShipment(null)}
          onConfirm={confirmUnassignShipment}
        />
      </main>
    </div>
  );
}