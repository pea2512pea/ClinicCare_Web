const renderUserHomePage = (req, res) => {
  console.log("User Home render");
  
  res.render("user/home");
};

const renderBookAppointmentPage = (req, res) => {
  res.render("user/book-appointment");
};

const renderAppointmentsPage = (req, res) => {
  res.render("user/appointments");
};

const renderProfilePage = (req, res) => {
  res.render("user/profile");
};

const renderAppointmentDetailsPage = (req, res) => {
  const appointmentId = req.params.id;
  res.render("user/appointments-detail", { appointmentId });
};

export default {
  renderUserHomePage,
  renderBookAppointmentPage,
  renderAppointmentsPage,
  renderProfilePage,
  renderAppointmentDetailsPage,
};
