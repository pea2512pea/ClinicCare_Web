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
  const container = document.getElementById("appointment-detail");
  const appointmentId = container.dataset.id;

  if (!appointmentId) return;

  try {
    const response = await axios.get(`/api/user/appointments/${appointmentId}`);
    const appointment = response.data;
    const totalDuration = appointment.Services.reduce(
      (sum, s) => sum + s.AppointmentServices.duration,
      0,
    );
    appointment.TotalDuration = totalDuration;
    renderAppointmentDetail(appointment);
  } catch (error) {
    container.innerHTML = "<p>Error loading appointment.</p>";
    showSnackbar(
      "Failed to load appointment details.",
      error.response?.data?.error || error.message,
      "error",
    );
    console.error(error);
  }
});

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

  container.innerHTML = `
        <div class="detail-header">
            <a href="/user/appointments" class="back-btn">← Back to History</a>
            <h1>Appointment Details</h1>
            <span class="status-badge status-${appointment.status.toLowerCase()}">${appointment.status}</span>
        </div>

        <div class="detail-grid">
            <div class="card info-card">
                <h3><i class="icon">📅</i> General Info</h3>
                <p><strong>Date:</strong> ${formatDate(appointment.appointment_date)}</p>
                <p><strong>Time:</strong> ${appointment.start_time}</p>
                <p><strong>Duration:</strong> ${appointment.TotalDuration} mins</p>
            </div>

            <div class="card info-card">
                <h3><i class="icon">👤</i> Patient</h3>
                <p><strong>Name:</strong> ${appointment.Patient.first_name} ${appointment.Patient.last_name}</p>
                <p><strong>Citizen ID:</strong> ${appointment.Patient.citizen_id}</p>
                <p><strong>Phone:</strong> ${appointment.Patient.phone}</p>
                <p><strong>Email:</strong> ${appointment.Patient.email}</p>
            </div>

            <div class="card info-card">
                <h3><i class="icon">🩺</i> Doctor</h3>
                <p><strong>Name:</strong> ${appointment.Doctor.first_name} ${appointment.Doctor.last_name}</p>
                <p><strong>Specialty:</strong> ${appointment.Doctor.specialty}</p>
                <p><strong>Phone:</strong> ${appointment.Doctor.phone}</p>
                <p><strong>Email:</strong> ${appointment.Doctor.email}</p>
            </div>
        </div>

        <div class="card table-card">
            <h3><i class="icon">📋</i> Services Rendered</h3>
            <table class="services-table">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Duration</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${servicesHtml}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2">Total Amount</td>
                        <td>$${totalPrice}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
