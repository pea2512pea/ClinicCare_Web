

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
  try {
    const res = await axios.get("/api/admin/dashboard");
    const data = res.data;
    console.log(data);

    document.getElementById("totalDoctors").textContent = data.totalDoctors;
    document.getElementById("totalPatients").textContent = data.totalPatients;
    document.getElementById("todayAppointments").textContent =
      data.todayAppointments;
    document.getElementById("pendingAppointments").textContent =
      data.pendingAppointments;

    renderRecentAppointments(data.recentAppointments);
    renderTopDoctors(data.topDoctors);
    console.log(data);

    renderAppointmentsToday(data.appointmentsToday);
  } catch (err) {
    console.error(err);
    showSnackbar("Failed to load dashboard data.", err.response?.data?.error || err.message, "error");
  }
});

function renderTopDoctors(doctors) {
  const container = document.getElementById("topDoctors");

  if (!doctors.length) {
    container.innerHTML = `<p class="text-gray-500">No data available</p>`;
    return;
  }
  container.innerHTML = doctors.map((d, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
      return `
          <tr>
              <td class="px-6 py-4">
                  <span style="margin-right: 8px;">${index < 3 ? medal : '•'}</span>
                  <strong>${d.first_name} ${d.last_name}</strong>
              </td>
              <td class="px-6 py-4 text-center">
                  <span class="badge-count">${d.appointmentCount || 0}</span>
              </td>
          </tr>
      `;
  }).join("");
}

function renderRecentAppointments(appointments) {
  const tbody = document.getElementById("recentAppointments");

  if (!appointments.length) {
    tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-gray-400">
                    No recent appointments
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = appointments
    .map(
      (a) => `
        <tr>
            <td class="px-6 py-4">
                ${new Date(a.appointment_date).toLocaleDateString()}
            </td>
            <td class="px-6 py-4">
                ${a.Patient?.first_name || ""} ${a.Patient?.last_name || ""}
            </td>
            <td class="px-6 py-4">
                ${a.Doctor?.first_name || "Deleted"} ${a.Doctor?.last_name || ""}
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs rounded 
                    ${statusColor(a.status)}">
                    ${a.status}
                </span>
            </td>
        </tr>
    `,
    )
    .join("");
}

function renderAppointmentsToday(appointments) {
  const tbody = document.getElementById("appointmentsToday");

  for (let a of appointments) {
    const totalDuration = a.Services.reduce(
      (sum, s) => sum + s.AppointmentServices.duration,
      0,
    );
    a.totalDuration = totalDuration;
  }

  console.log(appointments);

  if (!appointments.length) {
    tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-gray-400">
                    No appointments today
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = appointments
    .map(
      (a) => `
        <tr>
            <td class="px-6 py-4">
                ${a.start_time} (${a.totalDuration} mins)
            </td>
            <td class="px-6 py-4">
                ${a.Patient?.first_name || ""} ${a.Patient?.last_name || ""}
            </td>
            <td class="px-6 py-4">
                ${a.Doctor?.first_name || "Deleted"} ${a.Doctor?.last_name || ""}
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs rounded 
                    ${statusColor(a.status)}">
                    ${a.status}
                </span>
            </td>
        </tr>
    `,
    )
    .join("");
}

function statusColor(status) {
  switch (status) {
    case "Confirmed":
      return "bg-green-100 text-green-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
