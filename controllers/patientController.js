const renderPatientsPage = async (req, res) => {
  res.render("admin/patients/patients", { title: "Manage Patients" });
};

const renderPatientDetailsPage = async (req, res) => {
  const patientId = req.params.id;
  res.render("admin/patients/patients-detail", {
    title: "Patient Details",
    patientId,
  });
};

const renderAddPatientPage = async (req, res) => {
  res.render("admin/patients/patients-form", {
    title: "Add Patient",
    patientId: null,
  });
};

const renderEditPatientPage = async (req, res) => {
  const patientId = req.params.id;
  res.render("admin/patients/patients-form", {
    title: "Edit Patient",
    patientId,
  });
};

export default {
  renderPatientsPage,
  renderPatientDetailsPage,
  renderAddPatientPage,
  renderEditPatientPage,
};
