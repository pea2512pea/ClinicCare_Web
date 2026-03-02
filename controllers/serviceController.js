const renderServicesPage = async (req, res) => {
  res.render("admin/services/services", { title: "Manage Services" });
};

const renderServiceDetailsPage = async (req, res) => {
  const serviceId = req.params.id;
  res.render("admin/services/services-detail", {
    title: "Service Details",
    serviceId,
  });
};

const renderAddServicePage = async (req, res) => {
  res.render("admin/services/services-form", {
    title: "Add Service",
    serviceId: null,
  });
};

const renderEditServicePage = async (req, res) => {
  const serviceId = req.params.id;
  res.render("admin/services/services-form", {
    title: "Edit Service",
    serviceId,
  });
};

export default {
  renderServicesPage,
  renderServiceDetailsPage,
  renderAddServicePage,
  renderEditServicePage,
};
