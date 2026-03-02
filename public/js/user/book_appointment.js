let selectedServices = [];
let all_services = [];

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
  const services = axios.get("/api/user/services/all");
  services
    .then((response) => {
      all_services = response.data.services;
      renderBookingForm(response.data);
    })
    .catch((error) => {
      console.error("Error loading services:", error);
      showSnackbar(
        "Failed to load services. Please try again later.",
        error.response?.data?.error || error.message,
        "error",
      );
    });
});

function renderBookingForm(data) {
  const { services } = data || {};

  const container = document.getElementById("booking-form-container");
  container.innerHTML = `
    <form id="bookingForm" class="booking-card">
        <div class="form-section">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Appointment Date</label>
                    <input type="date" name="appointment_date" required class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Preferred Start Time</label>
                    <input type="time" name="start_time" required class="form-input">
                </div>
            </div>
        </div>

        <div class="form-section">
            <label class="form-label">Search & Add Services</label>
            <div class="search-box">
                <input type="text" placeholder="🔍 Search for a checkup, dental, etc." 
                       onInput="filterServices(this.value)" name="service_search" class="form-input">
            </div>
            
            <select name="service_id" onChange="selectServices(this.value)" class="form-select">
                <option value="" disabled selected>Select from results...</option>
                ${services.map((s) => `<option value="${s.id}">${s.service_name}</option>`).join("")}
            </select>

            <div id="selected-services" class="tags-container">
                </div>
        </div>

        <div class="form-footer">
            <button type="submit" class="btn-primary">Confirm Appointment</button>
        </div>
    </form>
    `;

  const bookingForm = document.getElementById("bookingForm");
  bookingForm.addEventListener("submit", handleBookingSubmit);
}

function selectServices(serviceId) {
  const service = all_services.find((s) => s.id == serviceId);
  if (service && !selectedServices.some((s) => s.id == serviceId)) {
    selectedServices.push(service);
  }

  renderSelectedServices();
  filterServices("");
}

function renderSelectedServices() {
  const container = document.getElementById("selected-services");
  if (selectedServices.length === 0) {
    container.innerHTML =
      '<p style="color: #94a3b8; font-size: 13px;">No services selected yet.</p>';
    return;
  }

  container.innerHTML = selectedServices
    .map(
      (s) => `
        <div class="service-tag">
            ${s.service_name}
            <button type="button" onClick="removeService(${s.id})">&times;</button>
        </div>
    `,
    )
    .join("");
}

function removeService(serviceId) {
  selectedServices = selectedServices.filter((s) => s.id != serviceId);
  filterServices("");
  renderSelectedServices();
}

function filterServices(query) {
  query = query.toLowerCase();
  const exclude = selectedServices.map((s) => s.id).join(",");
  const new_Services = axios
    .get("/api/user/services?limit=10&search=" + query + "&exclude=" + exclude)
    .then((response) => {
      const services = response.data.services;
      const serviceSelect = document.querySelector('select[name="service_id"]');
      serviceSelect.innerHTML =
        '<option value="" disabled selected>Select a service</option>';
      services.forEach((service) => {
        const option = document.createElement("option");
        option.value = service.id;
        option.textContent = service.service_name;
        serviceSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error fetching services:", error);
      showSnackbar(
        "Failed to fetch services.",
        error.response?.data?.error || error.message,
        "error",
      );
    });
}

function handleBookingSubmit(event) {
  const submitButton = event.target.querySelector('button[type="submit"]');
  submitButton.classList.add("disabled");
  submitButton.disabled = true;

  console.log("Submitting booking form...");
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = {
    appointment_date: formData.get("appointment_date"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    service_ids: selectedServices.map((s) => s.id),
  };

  axios
    .post("/api/user/appointments", data)
    .then((response) => {
      showSnackbar("Appointment booked successfully!", "", "success");
      setTimeout(() => {
        window.location.href = "/user/appointments";
      }, 1500);
    })
    .catch((error) => {
      console.error(
        "Error booking appointment:",
        error.response?.data || error.message,
      );
      showSnackbar(
        "Failed to book appointment.",
        error.response?.data?.error || error.message,
        "error",
      );
      submitButton.classList.remove("disabled");
      submitButton.disabled = false;
    });
}
