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

function renderForm(container, doctor = null) {
  container.innerHTML = `
        <div class="form-card">
            <form id="doctor-form">
                <div class="form-grid">
                    
                    <div class="form-group full-width">
                        <label>Citizen ID</label>
                        <input type="text" name="citizen_id" value="${doctor ? doctor.citizen_id : ""}" required placeholder="13-digit ID" maxlength="13">
                    </div>

                    <div class="form-group">
                        <label>First Name</label>
                        <input type="text" name="first_name" value="${doctor ? doctor.first_name : ""}" required minlength="2" placeholder="First Name">
                    </div>

                    <div class="form-group">
                        <label>Last Name</label>
                        <input type="text" name="last_name" value="${doctor ? doctor.last_name : ""}" required minlength="2" placeholder="Last Name">
                    </div>

                    <div class="form-group full-width">
                        <label>Medical Specialty</label>
                        <input type="text" name="specialty" value="${doctor ? doctor.specialty : ""}" required placeholder="e.g., Cardiology, General Practice">
                    </div>

                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="text" name="phone" value="${doctor ? doctor.phone : ""}" required maxlength="10" placeholder="9-10 digit phone">
                    </div>

                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value="${doctor ? doctor.email : ""}" required placeholder="Email Address">
                    </div>

                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" name="user_name" value="${doctor ? doctor.user_name : ""}" required minlength="4" placeholder="Username">
                    </div>

                    <div class="form-group">
                        <label>Access Role</label>
                        <select name="role" class="form-select" required onchange="handleRoleChange(this.value)">
                            <option value="doctor" ${doctor && doctor.role === "doctor" ? "selected" : ""}>Doctor (Medical Staff)</option>
                            <option value="admin" ${doctor && doctor.role === "admin" ? "selected" : ""}>Admin (Full Access)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Password ${doctor ? "(Leave same to keep current)" : ""}</label>
                        <input type="password" name="password" value="${doctor ? doctor.password : ""}" required minlength="6" placeholder="${doctor ? "Leave blank to keep current password" : "Password"}">
                    </div>

                    <div class="form-group">
                        <label>Confirm Password</label>
                        <input type="password" name="confirm_password" value="${doctor ? doctor.password : ""}" required minlength="6" placeholder="${doctor ? "Leave blank to keep current password" : "Confirm Password"}">
                    </div>
                </div>

                <div class="form-actions">
                    <a href="/admin/doctors" class="btn-cancel">Cancel</a>
                    <button type="submit" class="btn-submit">${doctor ? "Update Staff Member" : "Register Doctor"}</button>
                </div>
            </form>
        </div>
    `;

  document
    .getElementById("doctor-form")
    .addEventListener("submit", (e) => handleSubmit(e, doctor));
}

function handleRoleChange(role) {
  if (role === "admin") {
    alert(
      "If you select admin role, this user will have full access to the system and can't be changed back to doctor role.",
    );
  }
}

async function handleSubmit(event, doctor) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    citizen_id: formData.get("citizen_id"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    specialty: formData.get("specialty"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    user_name: formData.get("user_name"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  if (
    !payload.citizen_id ||
    !payload.first_name ||
    !payload.last_name ||
    !payload.specialty ||
    !payload.phone ||
    !payload.email ||
    !payload.user_name ||
    !payload.password
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return showSnackbar("Invalid email format", "", "error");
  }
  if (payload.user_name.length < 4) {
    return showSnackbar(
      "Invalid username",
      "Username must be at least 4 characters",
      "error",
    );
  }
  if (payload.password.length < 6) {
    return showSnackbar(
      "Weak password",
      "Password must be at least 6 characters",
      "error",
    );
  }
  if (payload.password !== formData.get("confirm_password")) {
    return showSnackbar("Passwords do not match", "", "error");
  }

  try {
    if (doctor) {
      const doctorId = doctor.id;
      const response = await axios.put(
        `/api/admin/doctors/${doctorId}`,
        payload,
      );
      const updatedDoctor = response.data;
      if (updatedDoctor) {
        showSnackbar("Doctor updated successfully.", "", "success");
      } else {
        showSnackbar("Failed to update doctor.", "", "error");
      }
    } else {
      const response = await axios.post("/api/admin/doctors", payload);
      const newDoctor = response.data;
      if (newDoctor) {
        showSnackbar("Doctor created successfully.", "", "success");
      } else {
        showSnackbar("Failed to create doctor.", "", "error");
      }
    }
    window.location.href = "/admin/doctors";
  } catch (error) {
    console.error(error);
    showSnackbar(
      "Failed to save doctor",
      error.response?.data?.error || error.message,
      "error",
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("doctor-form-container");
  const doctorId = container.dataset.id;

  try {
    let doctor = null;
    if (doctorId) {
      const response = await axios.get(`/api/admin/doctors/${doctorId}`);
      doctor = response.data;
    }
    renderForm(container, doctor);
  } catch (error) {
    container.innerHTML = "<p>Error loading doctor data.</p>";
    console.error(error);
    showSnackbar(
      "Failed to load doctor data",
      error.response?.data?.error || error.message,
      "error",
    );
  }
});
