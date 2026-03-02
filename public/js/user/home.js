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
    const response = await axios.get("/api/auth");
    const userData = response.data;
    document.getElementById("userName").textContent = userData.user.first_name;
    loadAppointments();
  } catch (error) {
    console.log(error);
    console.error("Error fetching user data:", error);
    showSnackbar(
      "Failed to load user data. Please log in again.",
      error.response?.data?.error || error.message,
      "error",
    );
    axios
      .post("/api/auth/logout")
      .then((response) => {
        window.location.href = "/";
      })
      .catch((error) => {
        console.error("Error during logout:", error);
        window.location.href = "/";
      });
  }
});

async function loadAppointments() {
  try {
    const response = await axios.get("/api/user/upcoming-appointments");
    const appointments = response.data;
    const appointmentsContainer = document.getElementById("appointments");
    if (appointments.length === 0) {
      appointmentsContainer.innerHTML = "<p>No upcoming appointments.</p>";
      return;
    }
    appointmentsContainer.innerHTML = appointments
      .map(
        (appointment) => `
            <div class="appointment-card">
                <div class="status-badge">Confirmed</div>
                <h4>${appointment.Services.map((s) => s.service_name).join(", ")}</h4>
                <p><strong>Doctor:</strong> ${appointment.Doctor.first_name} ${appointment.Doctor.last_name}</p>
                <p class="date">📅 ${new Date(appointment.appointment_date).toLocaleDateString()}</p>
                <p class="time">⏰ ${appointment.start_time}</p>
                <a href="/user/appointments/${appointment.id}" class="details-link">View Details</a>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading appointments:", error);
    showSnackbar(
      "Failed to load appointments. Please try again later.",
      error.response?.data?.error || error.message,
      "error",
    );
  }
}

function goToBooking() {
  window.location.href = "/user/book-appointment";
}

function goToHistory() {
  window.location.href = "/user/appointment-history";
}

function logout() {
  axios
    .post("/api/auth/logout")
    .then((response) => {
      window.location.href = "/";
    })
    .catch((error) => {
      console.error("Error during logout:", error);
      showSnackbar(
        "Failed to logout. Please try again.",
        error.response?.data?.error || error.message,
        "error",
      );
    });
}
