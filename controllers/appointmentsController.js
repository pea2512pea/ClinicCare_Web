const renderAppointmentsPage = async (req, res) => {
  res.render("admin/appointments/appointments", {
    title: "Manage Appointments",
  });
};

const renderAppointmentDetailsPage = async (req, res) => {
  const appointmentId = req.params.id;
  res.render("admin/appointments/appointments-detail", {
    title: "Appointment Details",
    appointmentId,
  });
};

const renderAddAppointmentPage = async (req, res) => {
  res.render("admin/appointments/appointments-form", {
    title: "Add Appointment",
    appointmentId: null,
  });
};

const renderEditAppointmentPage = async (req, res) => {
  const appointmentId = req.params.id;
  res.render("admin/appointments/appointments-form", {
    title: "Edit Appointment",
    appointmentId,
  });
};

export default {
  renderAppointmentsPage,
  renderAppointmentDetailsPage,
  renderAddAppointmentPage,
  renderEditAppointmentPage,
};
