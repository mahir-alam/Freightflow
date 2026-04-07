const getAllShipments = (req, res) => {
  const shipments = [
    {
      id: 1,
      clientName: "Akij Group",
      pickupLocation: "Chattogram",
      dropoffLocation: "Dhaka",
      shipmentDate: "2026-04-06",
      truckType: "Covered Van",
      status: "Pending",
      negotiatedPrice: 42000,
      commissionAmount: 3000,
    },
    {
      id: 2,
      clientName: "Square Pharmaceuticals",
      pickupLocation: "Dhaka",
      dropoffLocation: "Khulna",
      shipmentDate: "2026-04-05",
      truckType: "Flatbed",
      status: "Assigned",
      negotiatedPrice: 38500,
      commissionAmount: 2500,
    },
    {
      id: 3,
      clientName: "PRAN-RFL Group",
      pickupLocation: "Gazipur",
      dropoffLocation: "Sylhet",
      shipmentDate: "2026-04-04",
      truckType: "Trailer",
      status: "In Transit",
      negotiatedPrice: 51000,
      commissionAmount: 4200,
    },
  ];

  res.json(shipments);
};

module.exports = {
  getAllShipments,
};