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
  document
    .getElementById("filterForm")
    .addEventListener("submit", handleSubmit);
  loadForm();
});

async function loadForm() {
  const servicesContainer = document.getElementById("servicesContainer");
  servicesContainer.innerHTML = "Loading services...";
  const response = await axios.get("/api/admin/services/all");

  const services = response.data;
  all_services = services.services;
  if (!services.services.length) {
    servicesContainer.innerHTML = "No services available";
    return;
  }
  servicesContainer.innerHTML = `
        <input type="text" placeholder="Search service by name" onChange="filterServices(this.value)" name="service_search">
        <select name="service_id" onChange="selectServices(this.value)">
            <option value="">-- Select Service --</option>
            ${services.services
              .map(
                (s) => `
                <option value="${s.id}">${s.service_name}</option>
            `,
              )
              .join("")}
        </select>
        <div id="selected-services">
            ${selectedServices
              .map(
                (s) => `
                <span>${s.service_name} <button type="button" onClick="removeService(${s.id})">x</button></span>
            `,
              )
              .join("")}
        </div>
    `;

  const doctorsContainer = document.getElementById("doctorsContainer");
  doctorsContainer.innerHTML = "Loading doctors...";
  const doctorsResponse = await axios.get("/api/admin/doctors/");
  const doctors = doctorsResponse.data;
  if (!doctors.doctors.length) {
    doctorsContainer.innerHTML = "No doctors available";
    return;
  }
  doctorsContainer.innerHTML = `
        <input type="text" placeholder="Search doctor by name" onChange="filterDoctors(this.value)" name="doctor_search">
        <select name="doctor_id" id="doctor_id">
            <option value="">-- Select Doctor --</option>
            ${doctors.doctors
              .map(
                (d) => `
                <option value="${d.id}">${d.first_name} ${d.last_name}</option>
            `,
              )
              .join("")}
        </select>
    `;
}

function filterDoctors(query) {
  query = query.toLowerCase();
  const new_Doctors = axios
    .get("/api/admin/doctors?limit=10&search=" + query)
    .then((response) => {
      const doctors = response.data.doctors;
      const doctorSelect = document.querySelector('select[name="doctor_id"]');
      doctorSelect.innerHTML =
        '<option value="" disabled selected>Select a doctor</option>';
      doctors.forEach((doctor) => {
        const option = document.createElement("option");
        option.value = doctor.id;
        option.textContent = doctor.first_name + " " + doctor.last_name;
        doctorSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error fetching doctors:", error);
    });
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
  container.innerHTML = selectedServices
    .map(
      (s) => `
        <span>${s.service_name} <button type="button" onClick="removeService(${s.id})">x</button></span>
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
    .get("/api/admin/services?limit=10&search=" + query + "&exclude=" + exclude)
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
    });
}

async function handleSubmit(e) {
  e.preventDefault();

  const status = document.getElementById("status").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const doctor_id = document.getElementById("doctor_id").value;
  const params = new URLSearchParams();

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    showSnackbar("Start date cannot be after end date.", "", "error");
    return;
  }

  if (endDate && !startDate) {
    showSnackbar(
      "Please provide a start date when end date is specified.",
      "",
      "error",
    );
    return;
  }

  if (startDate && !endDate) {
    showSnackbar(
      "Please provide an end date when start date is specified.",
      "",
      "error",
    );
    return;
  }

  if (status) params.append("status", status);
  if (startDate && endDate) {
    params.append("startDate", startDate);
    params.append("endDate", endDate);
  }
  if (selectedServices.length) {
    params.append("service_ids", selectedServices.map((s) => s.id).join(","));
  }
  if (doctor_id) {
    params.append("doctor_id", doctor_id);
  }

  try {
    const response = await axios.get(
      "/api/admin/reports/appointments?" + params.toString(),
    );

    const appointmentsCountContainer =
      document.getElementById("appointmentsCount");
    const countAppointments = response.data.reduce((acc, appointment) => {
      const date = new Date(appointment.appointment_date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    let countHtml = "<h3>Appointments Count by Date</h3><ul>";

    for (const [date, count] of Object.entries(countAppointments)) {
      countHtml += `<li>${date}: ${count} appointments</li>`;
    }
    countHtml += "</ul>";

    for (const appointment of response.data) {
      const totalDuration = appointment.Services.reduce((sum, service) => {
        return sum + (service.AppointmentServices.duration || 0);
      }, 0);
      appointment.totalDuration = totalDuration;
    }

    appointmentsCountContainer.innerHTML = countHtml;

    renderTable(response.data);
  } catch (error) {
    showSnackbar(
      "Failed to load report.",
      error.response?.data?.error || error.message,
      "error",
    );
  }
}

function renderTable(appointments) {
  const tbody = document.getElementById("reportTable");

  if (!appointments.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="no-data">No results found for these filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = appointments
    .map((a, index) => {
      const statusClass = `status-${a.status.toLowerCase()}`;

      return `
      <tr>
        <td style="color: var(--text-muted)">${index + 1}</td>
        <td><strong>${new Date(a.appointment_date).toLocaleDateString()}</strong></td>
        <td>
          <div style="font-weight: 600">${a.start_time}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted)">${a.totalDuration} mins</div>
        </td>
        <td>${a.Patient ? `${a.Patient.first_name} ${a.Patient.last_name}` : "-"}</td>
        <td>Dr. ${a.Doctor ? a.Doctor.last_name : "-"}</td>
        <td style="max-width: 200px; font-size: 0.85rem">${a.Services && a.Services.length ? a.Services.map((s) => s.service_name).join(", ") : "-"}</td>
        <td><span class="status-badge ${statusClass}">${a.status}</span></td>
      </tr>
    `;
    })
    .join("");
}
