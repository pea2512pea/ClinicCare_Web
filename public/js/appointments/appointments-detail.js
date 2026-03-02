document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("appointment-detail");
  const appointmentId = container.dataset.id;

  if (!appointmentId) return;
  try {
    const response = await axios.get(
      `/api/admin/appointments/${appointmentId}`,
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
  const totalPrice = appointment.Services.reduce((sum, s) => sum + s.AppointmentServices.price, 0);

  container.innerHTML = `
    <div class="card full-width">
        <h2>General Info</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <p><strong>Date:</strong> ${formatDate(appointment.appointment_date)}</p>
            <p><strong>Time:</strong> ${appointment.start_time}</p>
            <p><strong>Status:</strong> <span class="status-pill status-${appointment.status.toLowerCase()}">${appointment.status}</span></p>
        </div>
    </div>

    <div class="card">
        <h2>Patient Details</h2>
        <div class="detail-row"><strong>Name:</strong> <span>${appointment.Patient.first_name} ${appointment.Patient.last_name}</span></div>
        <div class="detail-row"><strong>ID:</strong> <span>${appointment.Patient.citizen_id}</span></div>
        <div class="detail-row"><strong>Phone:</strong> <span>${appointment.Patient.phone}</span></div>
    </div>

    <div class="card">
        <h2>Assigned Doctor</h2>
        <div class="detail-row"><strong>Name:</strong> <span>Dr. ${appointment.Doctor.first_name} ${appointment.Doctor.last_name}</span></div>
        <div class="detail-row"><strong>Specialty:</strong> <span>${appointment.Doctor.specialty}</span></div>
        <div class="detail-row"><strong>Email:</strong> <span>${appointment.Doctor.email}</span></div>
    </div>

    <div class="card full-width">
        <h2>Services Provided</h2>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Duration</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                ${appointment.Services.map(s => `
                    <tr>
                        <td>${s.service_name}</td>
                        <td>${s.AppointmentServices.duration} mins</td>
                        <td>$${s.AppointmentServices.price}</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr style="font-weight: 800; font-size: 1.1rem; background: #f8fafc;">
                    <td colspan="2">Total Estimate</td>
                    <td style="color: #2a9d8f;">$${totalPrice}</td>
                </tr>
            </tfoot>
        </table>
    </div>
  `;

  if (appointment.status.toLowerCase() === "pending") {
    renderActions(appointment);
  } else {
    document.getElementById("actions").style.display = "none";
  }
}

function renderActions(appointment) {
  const action = document.getElementById("actions");
  action.innerHTML = `
        <button class="btn-reject" onclick="cancelAppointment(${appointment.id})">Reject Appointment</button>
        <button class="btn-approve" onclick="ApproveAppointment(${appointment.id})">Confirm & Approve</button>
    `;
}

function ApproveAppointment(appointmentId) {
  if (confirm("Are you sure you want to approve this appointment?")) {
    axios
      .post(`/api/admin/appointments/${appointmentId}/approve`)
      .then(() => {
        showSnackbar("Appointment approved", "", "success");
        location.reload();
      })
      .catch((error) => {
        showSnackbar(
          "Failed to approve appointment",
          error.response?.data?.error || error.message,
          "error",
        );
        console.error(error);
      });
  }
}

function cancelAppointment(appointmentId) {
  if (confirm("Are you sure you want to cancel this appointment?")) {
    axios
      .post(`/api/admin/appointments/${appointmentId}/reject`)
      .then(() => {
        showSnackbar("Appointment rejected", "", "success");
        location.reload();
      })
      .catch((error) => {
        showSnackbar(
          "Failed to reject appointment",
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
