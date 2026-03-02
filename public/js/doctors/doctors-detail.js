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
    const container = document.getElementById("doctor-detail");
    const doctorId = container.dataset.id;

    if (!doctorId) return;

    try {
        const response = await axios.get(`/api/admin/doctors/${doctorId}`);
        const doctor = response.data;
        renderDoctorDetail(doctor);
    } catch (error) {
        container.innerHTML = "<p>Error loading doctor details.</p>";
        console.error(error);
        showSnackbar("Failed to load doctor details", error.response?.data?.error || error.message, "error");
    }
});
function renderDoctorDetail(doctor) {
    const container = document.getElementById("doctor-detail");
    
    container.innerHTML = `
        <div class="card">
            <div class="profile-header-block">
                <div class="profile-avatar-circle">
                    ${doctor.first_name[0]}${doctor.last_name[0]}
                </div>
                <div class="profile-title-text">
                    <h2>Dr. ${doctor.first_name} ${doctor.last_name}</h2>
                    <span class="specialty-badge">${doctor.specialty}</span>
                    <span class="role-tag role-${doctor.role.toLowerCase()}">${doctor.role}</span>
                </div>
            </div>

            <hr class="divider">

            <div class="patient-info-grid">
                <div class="info-item">
                    <label>Citizen ID</label>
                    <span><code>${doctor.citizen_id}</code></span>
                </div>
                <div class="info-item">
                    <label>Staff Username</label>
                    <span>${doctor.user_name}</span>
                </div>
                <div class="info-item">
                    <label>Phone Number</label>
                    <span>${doctor.phone}</span>
                </div>
                <div class="info-item">
                    <label>Email Address</label>
                    <span>${doctor.email}</span>
                </div>
            </div>
        </div>
    `;
}