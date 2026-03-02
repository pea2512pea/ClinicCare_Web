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

document.addEventListener("DOMContentLoaded", function() {
    fetchAppointments();
});

let currentPage = 1;
let searchQuery = "";
let limit = 5;
function fetchAppointments(page = 1) {
    axios.get(`/api/doctor/appointments?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`)
        .then(response => {
            const { appointments, totalPages } = response.data;
            currentPage = page;
            renderAppointments(appointments);
            renderPagination(totalPages);
        })
        .catch(error => {
            console.error("Error fetching appointments:", error);
            showSnackbar("Failed to fetch appointments.", error.response?.data?.error || error.message, "error");
        });
}

function renderAppointments(appointments) {
    const container = document.getElementById("appointments-container");
    if (appointments.length === 0) {
        container.innerHTML = "<p>No appointments found.</p>";
        return;
    }
    container.innerHTML = appointments.map(appointment => `
        <div class="appointment-card">
            <h4>${appointment.Services.map(s => s.service_name).join(", ")}</h4>
            <p>Doctor: ${appointment.Doctor.first_name} ${appointment.Doctor.last_name}</p>
            <p>Date: ${appointment.appointment_date} Time: ${appointment.start_time} - ${appointment.end_time}</p>
            <p>Status: ${appointment.status}</p>
            <a href="/doctor/appointments/${appointment.id}">View Details</a>
        </div>
    `).join("");
}