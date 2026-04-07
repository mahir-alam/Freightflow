const getHealthStatus = (req, res) => {
  res.json({ message: "FreightFlow API is running" });
};

module.exports = {
  getHealthStatus,
};