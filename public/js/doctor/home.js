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

document.addEventListener("DOMContentLoaded", () => {
  loadAppointments();
  todaysAppointments();
});

async function todaysAppointments() {
  try {
    const response2 = await axios.get("/api/doctor/appointments/today");
    const appointment = response2.data;
    const tableBody2 = document.getElementById("today-appointment-table-body");
    tableBody2.innerHTML = "";
    if (appointment.length === 0) {
      tableBody2.innerHTML =
        "<tr><td colspan='6'>No appointments for today</td></tr>";
    } else {
      appointment.forEach((appointment2) => {
        console.log(appointment2);

        const totalDuration = appointment2.Services.reduce(
          (sum, s) => sum + s.AppointmentServices.duration,
          0,
        );
        appointment2.TotalDuration = totalDuration;

        const row = `
            <tr>
                <td>${appointment2.Patient?.first_name} ${appointment2.Patient?.last_name}</td>
                <td>
                    <div style="font-weight: 600;">${appointment2.start_time}</div>
                    <div style="font-size: 0.8rem; color: #64748b;">${appointment2.TotalDuration} mins</div>
                </td>
                <td><i style="color: #94a3b8;">${appointment2.reason || "General Consultation"}</i></td>
                <td><span class="status-pill status-${appointment2.status.toLowerCase()}">${appointment2.status}</span></td>
                <td>
                    <a href="/doctor/appointments/${appointment2.id}" class="view-link">Open Record</a>
                </td>
            </tr>
        `;
        tableBody2.innerHTML += row;
      });
    }
  } catch (error) {
    console.error("Failed to load today's appointments");
    showSnackbar(
      "Failed to load today's appointments",
      error.response?.data?.error || error.message,
      "error",
    );
  }
}

async function loadAppointments() {
  try {
    const response = await axios.get("/api/doctor/upcoming-appointments");
    const appointments = response.data;
    for (const appointment of appointments) {
      const totalDuration = appointment.Services.reduce(
        (sum, s) => sum + s.AppointmentServices.duration,
        0,
      );
      appointment.TotalDuration = totalDuration;
    }

    const tableBody = document.getElementById("appointment-table-body");
    tableBody.innerHTML = "";
    if (appointments.length === 0) {
      tableBody.innerHTML =
        "<tr><td colspan='5'>No upcoming appointments</td></tr>";
      return;
    } else {
      appointments.forEach((appointment) => {
        const rowUpcoming = `
            <tr>
                <td>${appointment.Patient?.first_name} ${appointment.Patient?.last_name}</td>
                <td>${new Date(appointment.appointment_date).toLocaleDateString()}</td>
                <td>${appointment.start_time}</td>
                <td>${appointment.reason || "Regular Visit"}</td>
                <td><span class="status-pill status-${appointment.status.toLowerCase()}">${appointment.status}</span></td>
            </tr>
        `;
        tableBody.innerHTML += rowUpcoming;
      });
    }
  } catch (error) {
    console.error("Failed to load appointments");
    showSnackbar(
      "Failed to load appointments",
      error.response?.data?.error || error.message,
      "error",
    );
  }
}

async function updateStatus(id, status) {
  try {
    await axios.put(
      `/api/doctor/appointments/${id}/status`,
      { status },
      { withCredentials: true },
    );
    loadAppointments();
  } catch (error) {
    showSnackbar(
      "Failed to update status",
      error.response?.data?.error || error.message,
      "error",
    );
  }
}
