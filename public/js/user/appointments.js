document.addEventListener("DOMContentLoaded", function () {
  fetchAppointments();
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

let currentPage = 1;
let searchQuery = "";
let limit = 5;
let searchTimer;

function fetchAppointments(page = 1) {
  axios
    .get(
      `/api/user/appointments?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    )
    .then((response) => {
      const { appointments, totalPages } = response.data;
      console.log(appointments);

      currentPage = page;
      renderAppointments(appointments);
      renderPagination(totalPages);
    })
    .catch((error) => {
      console.error("Error fetching appointments:", error);
      showSnackbar(
        "Failed to fetch appointments.",
        error.response?.data?.error || error.message,
        "error",
      );
    });
}

function handleSearch(val) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = val;
    fetchAppointments(1);
  }, 500);
}

function clearSearch() {
  searchQuery = "";
  document.getElementById("search-input").value = "";
  fetchAppointments(1);
}

function renderAppointments(appointments) {
  const container = document.getElementById("appointments-container");
  if (appointments.length === 0) {
    container.innerHTML = `
          <div class="empty-state">
              <i>🔍</i>
              <p>No appointments match your search "${searchQuery}"</p>
              <button onclick="clearSearch()" class="btn-outline">Clear Search</button>
          </div>
      `;
    return;
  }
  container.innerHTML = appointments
    .map(
      (appointment) => `
      <div class="appointment-list-item" onclick="window.location.href='/user/appointments/${appointment.id}'">
          <div class="appt-info">
              <span class="appt-date">📅 ${new Date(appointment.appointment_date).toLocaleDateString()}</span>
              <h4>${appointment.Services.map((s) => s.service_name).join(", ")}</h4>
              <p class="appt-doctor">Doctor: ${appointment.Doctor.first_name} ${appointment.Doctor.last_name}</p>
          </div>

          <div class="appt-meta">
              <span class="status-badge status-${appointment.status.toLowerCase()}">${appointment.status}</span>
              <p class="appt-time">🕒 ${appointment.start_time}</p>
              <span class="appt-arrow">→</span>
          </div>
      </div>
  `,
    )
    .join("");
}

function renderPagination(totalPages) {
  const container = document.getElementById("pagination-container");
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }
  let paginationHTML = "";
  // show only 1 page numbers around the current page and next and previous buttons
  if (currentPage > 1) {
    paginationHTML += `<button onClick="fetchAppointments(${currentPage - 1})">Previous</button>`;
  }
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<button disabled>${i}</button>`;
    } else if (i === currentPage - 1 || i === currentPage + 1) {
      paginationHTML += `<button onClick="fetchAppointments(${i})">${i}</button>`;
    }
  }
  if (currentPage < totalPages) {
    paginationHTML += `<button onClick="fetchAppointments(${currentPage + 1})">Next</button>`;
  }
  container.innerHTML = paginationHTML;
}
