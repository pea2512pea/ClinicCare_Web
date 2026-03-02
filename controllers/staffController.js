const renderTodaysAppointmentsPage = async (req, res) => {
  try {
    res.render("admin/todaysAppointment");
  } catch (error) {
    res.status(500).json({
      error: "Failed to render today's appointments page",
      details: error.message,
    });
  }
};

const renderDoctorHomePage = async (req, res) => {
  try {
    res.render("doctor/home");
  } catch (error) {
    res.status(500).json({
      error: "Failed to render doctor's home page",
      details: error.message,
    });
  }
};

const renderDoctorAppointmentDetailsPage = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    res.render("doctor/appointments-detail", { appointmentId });
  } catch (error) {
    res.status(500).json({
      error: "Failed to render doctor's appointment details page",
      details: error.message,
    });
  }
};


export default {
  renderTodaysAppointmentsPage,
  renderDoctorHomePage,
  renderDoctorAppointmentDetailsPage,
};
