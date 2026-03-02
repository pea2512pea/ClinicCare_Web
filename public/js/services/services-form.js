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

function renderForm(container, service = null) {
  container.innerHTML = `
        <div class="form-card narrow-card">
            <form id="service-form">
                <div class="form-grid single-column">
                    
                    <div class="form-group">
                        <label>Service Name</label>
                        <input type="text" name="service_name" 
                               value="${service ? service.service_name : ""}" 
                               placeholder="e.g., General Consultation" required>
                    </div>

                    <div class="form-group">
                        <label>Base Price (฿)</label>
                        <div class="input-with-icon">
                            <span class="input-icon">฿</span>
                            <input type="number" step="0.01" name="price" 
                                   value="${service ? service.price : ""}" 
                                   placeholder="0.00" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Duration (Minutes)</label>
                        <div class="input-with-icon">
                            <span class="input-icon">⏱</span>
                            <input type="number" name="duration" 
                                   value="${service ? service.duration : ""}" 
                                   placeholder="e.g., 30" required>
                        </div>
                    </div>

                </div>

                <div class="form-actions">
                    <a href="/admin/services" class="btn-cancel">Cancel</a>
                    <button type="submit" class="btn-submit">
                        ${service ? "Update Service" : "Create New Service"}
                    </button>
                </div>
            </form>
        </div>
    `;

  document
    .getElementById("service-form")
    .addEventListener("submit", (e) => handleSubmit(e, service));
}

async function handleSubmit(event, service) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    service_name: formData.get("service_name"),
    price: parseFloat(formData.get("price")),
    duration: parseInt(formData.get("duration")),
  };

  try {
    if (service) {
      const serviceId = service.id;
      const response = await axios.put(
        `/api/admin/services/${serviceId}`,
        payload,
      );
      const updatedService = response.data;
      if (updatedService) {
        showSnackbar("Service updated successfully.");
      } else {
        showSnackbar("Failed to update service.", "", "error");
      }
    } else {
      const response = await axios.post("/api/admin/services", payload);
      const newService = response.data;
      if (newService) {
        showSnackbar("Service created successfully.");
      } else {
        showSnackbar("Failed to create service.", "", "error");
      }
    }
    window.location.href = "/admin/services";
  } catch (error) {
    console.error(error);
    showSnackbar(
      "Failed to save service.",
      error.response?.data?.error || error.message,
      "error",
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("service-form-container");
  const serviceId = container.dataset.id;
  try {
    let service = null;
    if (serviceId) {
      const response = await axios.get(`/api/admin/services/${serviceId}`);
      service = response.data;
    }
    renderForm(container, service);
  } catch (error) {
    container.innerHTML = "<p>Error loading service data.</p>";
    showSnackbar(
      "Failed to load service data.",
      error.response?.data?.error || error.message,
      "error",
    );
    console.error(error);
  }
});
