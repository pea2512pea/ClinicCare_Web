const renderTodaysAppointmentsPage = async (req, res) => {
  res.render("admin/todaysAppointment");
};

const renderDoctorHomePage = async (req, res) => {
  res.render("doctor/home");
};

const renderDoctorAppointmentDetailsPage = async (req, res) => {
  const appointmentId = req.params.id;
  res.render("doctor/appointments-detail", { appointmentId });
};


export default {
  renderTodaysAppointmentsPage,
  renderDoctorHomePage,
  renderDoctorAppointmentDetailsPage,
};
