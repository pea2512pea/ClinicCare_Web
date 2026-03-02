function showSnackbar(message, detail = "", type = "success") {
  const snackbar = document.getElementById("snackbar");

  snackbar.querySelector(".message").textContent = message;
  snackbar.querySelector(".detail").textContent = detail;

  snackbar.className = "";
  snackbar.classList.add("snackbar", "show", type);

  setTimeout(() => {
    snackbar.classList.remove("show");
    snackbar.classList.remove(type);
    snackbar.classList.remove("snackbar");
    snackbar.querySelector(".message").textContent = "";
    snackbar.querySelector(".detail").textContent = "";
  }, 3000);
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("patient-detail");
  const patientId = container.dataset.id;

  if (!patientId) return;

  try {
    const response = await axios.get(`/api/admin/patients/${patientId}`);
    const patient = response.data;
    renderPatientDetail(patient);
  } catch (error) {
    container.innerHTML = "<p>Error loading patient details.</p>";
    showSnackbar(
      "Failed to load patient details.",
      error.response?.data?.error || error.message,
      "error",
    );
    console.error(error);
  }
});

function renderPatientDetail(patient) {
  const container = document.getElementById("patient-detail");

  const appointments = patient.Appointments || [];

  container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Personal Information</h2>
            </div>
            <div class="patient-info-grid">
                <div class="info-item">
                    <label>Full Name</label>
                    <span>${patient.first_name} ${patient.last_name}</span>
                </div>
                <div class="info-item">
                    <label>Citizen ID</label>
                    <span><code>${patient.citizen_id}</code></span>
                </div>
                <div class="info-item">
                    <label>Phone Number</label>
                    <span>${patient.phone}</span>
                </div>
                <div class="info-item">
                    <label>Email Address</label>
                    <span>${patient.email}</span>
                </div>
            </div>
        </div>

        <div class="card table-card">
            <div class="card-header">
                <h2>Appointment History</h2>
            </div>
            <table class="clean-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Doctor</th>
                        <th>Status</th>
                        <th class="text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                      appointments.length > 0
                        ? appointments
                            .map(
                              (app) => `
                        <tr>
                            <td>${new Date(app.appointment_date).toLocaleDateString()}</td>
                            <td>Dr. ${app.Doctor?.last_name || "N/A"}</td>
                            <td><span class="status-pill status-${app.status.toLowerCase()}">${app.status}</span></td>
                            <td class="text-right"><a href="/admin/appointments/${app.id}" class="action-link">Details</a></td>
                        </tr>
                    `,
                            )
                            .join("")
                        : `
                        <tr>
                            <td colspan="4" class="text-center text-gray-400" style="padding: 40px;">
                                No appointment history found for this patient.
                            </td>
                        </tr>
                    `
                    }
                </tbody>
            </table>
        </div>
    `;
}
