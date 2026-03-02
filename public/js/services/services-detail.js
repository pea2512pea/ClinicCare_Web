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
  const container = document.getElementById("service-detail");
  const serviceId = container.dataset.id;

  if (!serviceId) return;

  try {
    const response = await axios.get(`/api/admin/services/${serviceId}`);
    const service = response.data;
    renderServiceDetail(service);
  } catch (error) {
    container.innerHTML = "<p>Error loading service details.</p>";
    showSnackbar(
      "Failed to load service details.",
      error.response?.data?.error || error.message,
      "error",
    );
    console.error(error);
  }
});

function renderServiceDetail(service) {
  const container = document.getElementById("service-detail");

  // Safety check for pricing
  const formattedPrice = Number(service.price).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  container.innerHTML = `
        <div class="card service-profile-card">
            <div class="service-header-section">
                <div class="service-icon-box">🩺</div>
                <div class="service-main-info">
                    <h2>${service.service_name}</h2>
                    <span class="status-pill status-confirmed">Active Service</span>
                </div>
            </div>

            <hr class="divider">

            <div class="patient-info-grid">
                <div class="info-item">
                    <label>Base Price</label>
                    <span class="price-highlight">฿${formattedPrice}</span>
                </div>
                <div class="info-item">
                    <label>Standard Duration</label>
                    <span class="duration-text">${service.duration || "30"} Minutes</span>
                </div>
                <div class="info-item full-width">
                    <label>Service Description</label>
                    <p class="description-text">
                        ${service.description || "No detailed description provided for this medical service."}
                    </p>
                </div>
            </div>
        </div>
    `;
}
