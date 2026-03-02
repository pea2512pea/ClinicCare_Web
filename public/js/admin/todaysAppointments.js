document.addEventListener("DOMContentLoaded", function () {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("current-date-display").textContent =
    new Date().toLocaleDateString(undefined, options);

  loadTodaysAppointments();
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
document.addEventListener("DOMContentLoaded", function () {
  // Set the date display
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("current-date-display").textContent =
    new Date().toLocaleDateString(undefined, options);

  loadTodaysAppointments();
});

// ... showSnackbar remains the same ...

async function loadTodaysAppointments() {
  try {
    const response = await axios.get("/api/admin/appointments/today");
    const appointments = response.data;

    // Helper to calculate duration
    const processAppointment = (a) => {
      a.TotalDuration = a.Services.reduce(
        (sum, s) => sum + s.AppointmentServices.duration,
        0,
      );
      return `
        <tr>
          <td><strong>${a.Patient?.first_name} ${a.Patient?.last_name}</strong></td>
          <td>${a.start_time} <small class="text-gray-400">(${a.TotalDuration} mins)</small></td>
          <td><span class="status-pill status-${a.status.toLowerCase()}">${a.status}</span></td>
          <td>
            <a href="/admin/appointments/${a.id}" class="btn-view">Details</a>
          </td>
        </tr>
      `;
    };

    // 1. Render Full Schedule
    const todayBody = document.getElementById("today-appointment-table-body");
    todayBody.innerHTML = appointments.length
      ? appointments.map(processAppointment).join("")
      : "<tr><td colspan='5' class='text-center'>No appointments scheduled for today.</td></tr>";

    // 2. Render Pending only
    const pendingBody = document.getElementById(
      "pending-appointment-table-body",
    );
    const pendingOnly = appointments.filter(
      (a) => a.status.toLowerCase() === "pending",
    );

    pendingBody.innerHTML = pendingOnly.length
      ? pendingOnly.map(processAppointment).join("")
      : "<tr><td colspan='5' class='text-center text-gray-400'>🎉 All caught up! No pending requests.</td></tr>";
  } catch (error) {
    console.error(error);
    showSnackbar("Error", "Could not refresh appointments", "error");
  }
}
