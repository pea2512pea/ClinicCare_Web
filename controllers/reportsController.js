const renderReport1Page = async (req, res) => {
  res.render("admin/reports/report1", { title: "Report 1", services });
};

const renderReport2Page = (req, res) => {
  res.render("admin/reports/report2", { title: "Report 2" });
};

const renderDashboardPage = (req, res) => {
  res.render("admin/dashboard", { title: "Dashboard" });
};

export default {
  renderReport1Page,
  renderReport2Page,
  renderDashboardPage,
};
