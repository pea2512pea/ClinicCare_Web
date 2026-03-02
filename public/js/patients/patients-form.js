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
function renderForm(container, patient = null) {
  container.innerHTML = `
    <div class="form-card">
      <form id="patient-form">
        <div class="form-grid">
          
          <div class="form-group full-width">
            <label>Citizen ID</label>
            <input type="text" name="citizen_id" value="${patient ? patient.citizen_id : ""}" required placeholder="13-digit ID" maxlength="13">
          </div>

          <div class="form-group">
            <label>First Name</label>
            <input type="text" name="first_name" value="${patient ? patient.first_name : ""}" required minlength="2" placeholder="First Name">
          </div>

          <div class="form-group">
            <label>Last Name</label>
            <input type="text" name="last_name" value="${patient ? patient.last_name : ""}" required minlength="2" placeholder="Last Name">
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone" value="${patient ? patient.phone : ""}" required maxlength="10" placeholder="9-10 digit phone">
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value="${patient ? patient.email : ""}" required ${patient ? "disabled" : ""} placeholder="Email Address">
          </div>

          ${
            !patient
              ? `
            <div class="form-group">
              <label>Password</label>
              <input type="password" name="password" required minlength="6" placeholder="Password">
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirm_password" required minlength="6" placeholder="Confirm Password">
            </div>
          `
              : ""
          }
        </div>

        <div class="form-actions">
          <a href="/admin/patients" class="btn-cancel">Cancel</a>
          <button type="submit" class="btn-submit">${patient ? "Update Patient" : "Create Patient"}</button>
        </div>
      </form>
    </div>
  `;

  document
    .getElementById("patient-form")
    .addEventListener("submit", (e) => handleSubmit(e, patient));
}

async function handleSubmit(event, patient) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    citizen_id: formData.get("citizen_id"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  };

  if (
    !payload.citizen_id ||
    !payload.first_name ||
    !payload.last_name ||
    !payload.phone
  ) {
    showSnackbar("Please fill in all required fields.", "", "error");
    return;
  }
  if (!/^\d{13}$/.test(payload.citizen_id)) {
    return showSnackbar("Invalid Citizen ID", "Must be 13 digits", "error");
  }

  if (payload.first_name.length < 2 || payload.last_name.length < 2) {
    return showSnackbar(
      "Invalid name",
      "Name must be at least 2 characters",
      "error",
    );
  }

  if (!/^\d{9,10}$/.test(payload.phone)) {
    return showSnackbar(
      "Invalid phone number",
      "Phone must be 9-10 digits",
      "error",
    );
  }
  if (!patient) {
    const password = formData.get("password");
    const confirm_password = formData.get("confirm_password");
    if (password.length < 6) {
      return showSnackbar(
        "Weak password",
        "Password must be at least 6 characters",
        "error",
      );
    }
    if (password !== confirm_password) {
      return showSnackbar("Passwords do not match", "", "error");
    }
    payload.password = password;

    if (!payload.email) {
      showSnackbar("Please enter an email address.", "", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return showSnackbar("Invalid email format", "", "error");
    }
  }

  try {
    if (patient) {
      const patientId = patient.id;
      const response = await axios.put(
        `/api/admin/patients/${patientId}`,
        payload,
      );
      const updatedPatient = response.data;
      if (updatedPatient) {
        showSnackbar("Patient updated successfully.", "", "success");
      } else {
        showSnackbar("Failed to update patient.", "", "error");
      }
    } else {
      const response = await axios.post("/api/admin/patients", payload);
      const newPatient = response.data;
      if (newPatient) {
        showSnackbar("Patient created successfully.", "", "success");
      } else {
        showSnackbar("Failed to create patient.", "", "error");
      }
    }
    window.location.href = "/admin/patients";
  } catch (error) {
    console.error(error);
    showSnackbar(
      "Failed to save patient.",
      error.response?.data?.error || error.message,
      "error",
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("patient-form-container");
  const patientId = container.dataset.id;
  try {
    let patient = null;
    if (patientId) {
      const response = await axios.get(`/api/admin/patients/${patientId}`);
      patient = response.data;
      console.log(patient);
    }
    renderForm(container, patient);
  } catch (error) {
    container.innerHTML = "<p>Error loading patient data.</p>";
    showSnackbar(
      "Failed to load patient data.",
      error.response?.data?.error || error.message,
      "error",
    );
    console.error(error);
  }
});
