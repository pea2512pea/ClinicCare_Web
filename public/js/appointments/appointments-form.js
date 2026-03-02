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

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("appointment-form-container");
  const appointmentId = container.dataset.id;

  try {
    const [doctorsRes, servicesRes, patientsRes] = await Promise.all([
      axios.get("/api/admin/doctors"),
      axios.get("/api/admin/services/all"),
      axios.get("/api/admin/patients"),
    ]);

    const doctors = doctorsRes.data.doctors;
    const services = servicesRes.data.services;
    const patients = patientsRes.data.patients;
    all_services = services;

    let appointment = null;

    if (appointmentId) {
      const appointmentRes = await axios.get(
        `/api/admin/appointments/${appointmentId}`,
      );
      appointment = appointmentRes.data;
      for (const service of appointment.Services) {
        selectedServices.push(service);
      }

      if (selectedServices.length > 0) {
        console.log(selectedServices);

        filterServices("");
      }
    }

    renderForm(container, {
      appointment,
      doctors,
      patients,
      services,
    });
  } catch (error) {
    container.innerHTML = "<p>Error loading form data.</p>";
    console.error(error);
    showSnackbar(
      "Failed to load form data",
      error.response?.data?.error || error.message,
      "error",
    );
  }
});

function renderForm(container, data) {
  const { appointment, doctors, services, patients } = data;

  container.innerHTML = `
    <div class="form-card">
      <form id="appointment-form">
        <div class="form-grid">
          
          <div class="form-group">
            <label>Appointment Date</label>
            <input type="date" name="appointment_date" value="${appointment ? formatDateForInput(appointment.appointment_date) : ""}" required>
          </div>

          <div class="form-group">
            <label>Start Time</label>
            <input type="time" name="start_time" value="${appointment ? appointment.start_time : ""}" required>
          </div>

          <div class="form-group full-width">
            <label>Patient Selection</label>
            <div class="search-select-stack">
                <input type="text" class="search-inline" placeholder="🔍 Search patient by name..." oninput="filterPatients(this.value)">
                <select name="patient_id" class="form-select" required>
                    ${
                      appointment
                        ? `<option value="${appointment.Patient.id}" selected>${appointment.Patient.first_name} ${appointment.Patient.last_name}</option>`
                        : `<option value="" disabled selected>Select a patient</option>${patients.map((p) => `<option value="${p.id}">${p.first_name} ${p.last_name}</option>`).join("")}`
                    }
                </select>
            </div>
          </div>

          <div class="form-group full-width">
            <label>Medical Services (Multiple)</label>
            <div class="search-select-stack">
                <input type="text" class="search-inline" placeholder="🔍 Find services..." oninput="filterServices(this.value)">
                <select name="service_id" class="form-select" onchange="selectServices(this.value)">
                    <option value="" disabled selected>Select service to add</option>
                    ${services.map((s) => `<option value="${s.id}">${s.service_name}</option>`).join("")}
                </select>
            </div>
            <div id="selected-services" class="tag-container">
                ${selectedServices
                  .map(
                    (s) => `
                    <span class="service-tag">${s.service_name} <button type="button" onclick="removeService(${s.id})">&times;</button></span>
                `,
                  )
                  .join("")}
            </div>
          </div>

          <div class="form-group">
            <label>Assigned Doctor</label>
            <div class="search-select-stack">
                <input type="text" class="search-inline" placeholder="🔍 Search doctor..." oninput="filterDoctors(this.value)">
                <select name="doctor_id" class="form-select" required>
                    ${
                      appointment
                        ? `<option value="${appointment.Doctor.id}" selected>Dr. ${appointment.Doctor.first_name} ${appointment.Doctor.last_name}</option>`
                        : `<option value="" disabled selected>Select a doctor</option>${doctors.map((d) => `<option value="${d.id}">Dr. ${d.first_name} ${d.last_name}</option>`).join("")}`
                    }
                </select>
            </div>
          </div>

          <div class="form-group">
            <label>Appointment Status</label>
            <select name="status" class="form-select">
                ${renderStatusOptions(appointment)}
            </select>
          </div>

          <div class="form-group full-width">
            <label>Internal Remarks / Notes</label>
            <textarea name="remark" rows="3" placeholder="Add any clinical notes or special instructions...">${appointment ? appointment.remark : ""}</textarea>
          </div>
        </div>

        <div class="form-actions">
          <a href="/admin/appointments" class="btn-cancel">Cancel</a>
          <button type="submit" class="btn-submit">Save Appointment</button>
        </div>
      </form>
    </div>
  `;

  document
    .getElementById("appointment-form")
    .addEventListener("submit", (e) => handleSubmit(e, appointment));
}

function renderStatusOptions(appointment) {
  const statuses = ["pending", "confirmed", "cancelled", "completed"];

  return statuses
    .map(
      (status) => `
        <option value="${status}"
            ${appointment && appointment.status === status ? "selected" : ""}>
            ${status}
        </option>
    `,
    )
    .join("");
}

async function handleSubmit(event, appointment) {
  event.preventDefault();
  if (selectedServices.length === 0) {
    showSnackbar("Please select at least one service.", "", "error");
    return;
  }

  const formData = new FormData(event.target);
  const payload = {
    appointment_date: formData.get("appointment_date"),
    start_time: formData.get("start_time"),
    status: formData.get("status"),
    patient_id: formData.get("patient_id"),
    doctor_id: formData.get("doctor_id"),
    remark: formData.get("remark"),
    serviceIds: selectedServices.map((s) => s.id),
  };

  if (!payload.patient_id) {
    showSnackbar("Please select a patient from the list.", "", "error");
    return;
  }

  try {
    if (appointment) {
      const appointmentId = appointment.id;
      const response = await axios.put(
        `/api/admin/appointments/${appointmentId}`,
        payload,
      );
      const updatedAppointment = response.data;
      if (updatedAppointment) {
        showSnackbar("Appointment updated successfully.", "", "success");
      } else {
        showSnackbar("Failed to update appointment.", "", "error");
      }
    } else {
      const response = await axios.post("/api/admin/appointments", payload);
      const newAppointment = response.data;
      if (newAppointment) {
        showSnackbar("Appointment created successfully.", "", "success");
      } else {
        showSnackbar("Failed to create appointment.", "", "error");
      }
    }

    setTimeout(() => {
      window.location.href = "/admin/appointments";
    }, 4000);
  } catch (error) {
    console.error(error);
    showSnackbar(
      "Failed to save appointment.",
      error.response?.data?.error || error.message,
      "error",
    );
  }
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
        <span class="service-tag">${s.service_name} <button type="button" onclick="removeService(${s.id})">&times;</button></span>
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
      showSnackbar(
        "Failed to fetch services.",
        error.response?.data?.error || error.message,
        "error",
      );
    });
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
      showSnackbar(
        "Failed to fetch doctors.",
        error.response?.data?.error || error.message,
        "error",
      );
    });
}

function filterPatients(query) {
  query = query.toLowerCase();
  const new_Patients = axios
    .get("/api/admin/patients?limit=10&search=" + query)
    .then((response) => {
      const patients = response.data.patients;
      const patientSelect = document.querySelector('select[name="patient_id"]');
      patientSelect.innerHTML =
        '<option value="" disabled selected>Select a patient</option>';
      patients.forEach((patient) => {
        const option = document.createElement("option");
        option.value = patient.id;
        option.textContent = patient.first_name + " " + patient.last_name;
        patientSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error fetching patients:", error);
      showSnackbar(
        "Failed to fetch patients.",
        error.response?.data?.error || error.message,
        "error",
      );
    });
}

function formatDateForInput(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}
