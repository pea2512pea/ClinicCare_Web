const renderDoctorsPage = async (req, res) => {
  res.render("admin/doctors/doctors", { title: "Manage Doctors" });
};

const renderDoctorDetailsPage = async (req, res) => {
  const doctorId = req.params.id;
  res.render("admin/doctors/doctors-detail", {
    title: "Doctor Details",
    doctorId,
  });
};

const renderAddDoctorPage = async (req, res) => {
  res.render("admin/doctors/doctors-form", {
    title: "Add Doctor",
    doctorId: null,
  });
};

const renderEditDoctorPage = async (req, res) => {
  const doctorId = req.params.id;
  res.render("admin/doctors/doctors-form", {
    title: "Edit Doctor",
    doctorId,
  });
};

export default {
  renderDoctorsPage,
  renderDoctorDetailsPage,
  renderAddDoctorPage,
  renderEditDoctorPage,
};
