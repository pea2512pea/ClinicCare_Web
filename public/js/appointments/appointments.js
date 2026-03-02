let currentPage = 1;
let limit = 5;
let searchQuery = "";

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

async function fetchAppointments(page = 1) {
  try {
    const response = await axios.get(
      `/api/admin/appointments?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    );
    const { appointments, totalPages } = response.data;
    console.log(appointments);

    currentPage = page;
    renderAppointments(appointments);
    renderPagination(totalPages);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    showSnackbar(
      "Failed to fetch appointments.",
      error.response?.data?.error || error.message,
      "error",
    );
  }
}

function renderAppointments(appointments) {
  const tableBody = document.getElementById("appointments-table");
  tableBody.innerHTML = "";

  if (appointments.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:40px;">No appointments found.</td></tr>`;
    return;
  }

  appointments.forEach((appointment) => {
    const row = document.createElement("tr");

    // Formatting the date for better readability
    const appDate = new Date(appointment.appointment_date).toLocaleDateString(
      "en-GB",
    );

    row.innerHTML = `
      <td>
        <div class="datetime-cell">
          <strong>${appDate}</strong>
          <span>${appointment.start_time}</span>
        </div>
      </td>
      <td><strong>${appointment.Patient.first_name} ${appointment.Patient.last_name}</strong></td>
      <td><span class="service-list">${appointment.Services.map((s) => s.service_name).join(", ")}</span></td>
      <td>Dr. ${appointment.Doctor.first_name}</td>
      <td>
        <span class="status-pill status-${appointment.status.toLowerCase()}">
          ${appointment.status}
        </span>
      </td>
      <td class="text-right">
        <div class="row-actions">
          <a href="/admin/appointments/${appointment.id}" class="action-link">View</a>
          <a href="/admin/appointments-edit/${appointment.id}" class="action-link">Edit</a>
          <button onclick="deleteAppointment(${appointment.id})" class="action-link delete">Delete</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function deleteAppointment(id) {
  if (confirm("Are you sure you want to delete this appointment?")) {
    axios
      .delete(`/api/admin/appointments/${id}`)
      .then(() => {
        showSnackbar("Appointment deleted successfully.", "", "success");
        fetchAppointments(currentPage);
      })
      .catch((error) => {
        console.error("Error deleting appointment:", error);
        showSnackbar(
          "Failed to delete appointment.",
          error.response?.data?.error || error.message,
          "error",
        );
      });
  }
}

function handleSearch(event) {
  event.preventDefault();
  const searchInput = document.getElementById("appSearchInput");
  searchQuery = searchInput.value.trim();
  fetchAppointments(1);
}

function renderPagination(totalPages) {
  const paginationDiv = document.getElementById("pagination");
  paginationDiv.innerHTML = `<span>Page ${currentPage} of ${totalPages}</span>`;

  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.className = "btn-pagination";
    prevBtn.textContent = "Previous";
    prevBtn.onclick = () => fetchAppointments(currentPage - 1);
    paginationDiv.prepend(prevBtn);
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn-pagination";
    nextBtn.textContent = "Next";
    nextBtn.onclick = () => fetchAppointments(currentPage + 1);
    paginationDiv.appendChild(nextBtn);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAppointments();
});
