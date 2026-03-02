document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("appointment-detail");
  const appointmentId = container.dataset.id;

  if (!appointmentId) return;

  try {
    const response = await axios.get(
      `/api/doctor/appointments/${appointmentId}`,
    );
    const appointment = response.data;
    const totalDuration = appointment.Services.reduce(
      (sum, s) => sum + s.AppointmentServices.duration,
      0,
    );
    appointment.TotalDuration = totalDuration;
    renderAppointmentDetail(appointment);
  } catch (error) {
    container.innerHTML = "<p>Error loading appointment.</p>";
    console.error(error);
    showSnackbar(
      "Failed to load appointment details",
      error.response?.data?.error || error.message,
      "error",
    );
  }
});

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

function renderAppointmentDetail(appointment) {
  const container = document.getElementById("appointment-detail");

  const servicesHtml =
    appointment.Services.length > 0
      ? appointment.Services.map(
          (service) => `
            <tr>
                <td>${service.service_name}</td>
                <td>${service.AppointmentServices.duration} mins</td>
                <td>$${service.AppointmentServices.price}</td>
            </tr>
        `,
        ).join("")
      : `<tr><td colspan="2">No services</td></tr>`;

  const totalPrice = appointment.Services.reduce(
    (sum, s) => sum + s.AppointmentServices.price,
    0,
  );

  container.innerHTML = `<div class="detail-header">
        <a href="/doctor/" class="back-link">← Back to Schedule</a>
        <span class="status-badge status-${appointment.status.toLowerCase()}">${appointment.status}</span>
    </div>

    <div class="detail-grid">
        <div class="card info-card patient-highlight">
            <h3>👤 Patient Record</h3>
            <p><strong>Name:</strong> ${appointment.Patient.first_name} ${appointment.Patient.last_name}</p>
            <p><strong>Citizen ID:</strong> ${appointment.Patient.citizen_id}</p>
            <p><strong>Phone:</strong> ${appointment.Patient.phone}</p>
            <p><strong>Email:</strong> ${appointment.Patient.email}</p>
        </div>

        <div class="card info-card">
            <h3>📅 Schedule Info</h3>
            <p><strong>Date:</strong> ${formatDate(appointment.appointment_date)}</p>
            <p><strong>Time:</strong> ${appointment.start_time}</p>
            <p><strong>Total Duration:</strong> ${appointment.TotalDuration} mins</p>
        </div>
    </div>

    <div class="card table-card">
        <h3>📋 Services to Perform</h3>
        <table class="services-table">
            <thead>
                <tr>
                    <th>Service Name</th>
                    <th>Estimated Duration</th>
                    <th>Fee</th>
                </tr>
            </thead>
            <tbody>
                ${servicesHtml}
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="2">Total Revenue:</td>
                    <td>$${totalPrice}</td>
                </tr>
            </tfoot>
        </table>
    </div>
`;
  if (appointment.status === "confirmed") {
    renderActions(appointment);
  } else {
    document.getElementById("actions").innerHTML = "";
  }
}

function renderActions(appointment) {
  const actionContainer = document.getElementById("actions");
  actionContainer.innerHTML = `
        <div class="action-bar card">
            <h4>Update Appointment Status</h4>
            <div class="button-group">
                <button class="btn-complete" onclick="finishAppointment(${appointment.id})">
                    ✅ Mark as Completed
                </button>
                <button class="btn-cancel" onclick="cancelAppointment(${appointment.id})">
                    ❌ Cancel Appointment
                </button>
            </div>
        </div>
    `;
}

function finishAppointment(appointmentId) {
  if (confirm("Are you sure you want to mark this appointment as completed?")) {
    axios
      .post(`/api/doctor/appointments/${appointmentId}/complete`)
      .then(() => {
        showSnackbar("Appointment marked as completed.", "", "success");
        location.reload();
      })
      .catch((error) => {
        console.error(error);
        showSnackbar(
          "Failed to complete appointment",
          error.response?.data?.error || error.message,
          "error",
        );
      });
  }
}

function cancelAppointment(appointmentId) {
  if (confirm("Are you sure you want to cancel this appointment?")) {
    axios
      .post(`/api/doctor/appointments/${appointmentId}/cancel`)
      .then(() => {
        showSnackbar("Appointment cancelled.", "", "success");
        location.reload();
      })
      .catch((error) => {
        showSnackbar(
          "Failed to cancel appointment",
          error.response?.data?.error || error.message,
          "error",
        );
        console.error(error);
      });
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
