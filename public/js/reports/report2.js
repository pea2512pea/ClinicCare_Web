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
      showSnackbar(
        "Failed to load services.",
        error.response?.data?.error || error.message,
        "error",
      );
    });
}

async function handleSubmit(e) {
    e.preventDefault();

    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const params = new URLSearchParams();

    // Date Validations
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        showSnackbar("Start date cannot be after end date.", "", "error");
        return;
    }
    if ((startDate && !endDate) || (endDate && !startDate)) {
        showSnackbar("Please select a complete date range.", "", "error");
        return;
    }

    if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
    }
    if (selectedServices.length) {
        params.append("service_ids", selectedServices.map(s => s.id).join(","));
    }

    try {
        const response = await axios.get("/api/admin/reports/income?" + params.toString());
        const data = response.data;

        // 1. Show Dashboard
        document.getElementById("revenueDashboard").style.display = "grid";

        // 2. Update Total Revenue Card
        document.getElementById("totalRevenueText").textContent = 
            `฿${data.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

        // 3. Update Top Service Card
        if (data.topServices && data.topServices.length > 0) {
            const top = data.topServices[0];
            document.getElementById("topServiceName").textContent = top.service_name;
            document.getElementById("topServiceStats").textContent = 
                `${top.appointmentCount} bookings • ฿${top.totalRevenue.toLocaleString()}`;
        }

        // 4. Process Table Data
        const tableData = new Map();
        data.appointments.forEach(appt => {
            appt.Services.forEach(service => {
                if (!tableData.has(service.id)) {
                    tableData.set(service.id, {
                        service_name: service.service_name,
                        appointmentCount: 0,
                        totalRevenue: 0
                    });
                }
                const entry = tableData.get(service.id);
                entry.appointmentCount += 1;
                entry.totalRevenue += (service.AppointmentServices.price || 0);
            });
        });

        renderTable(tableData);
    } catch (error) {
        showSnackbar("Failed to load report.", error.message, "error");
    }
}

function renderTable(appointments) {
    const tbody = document.getElementById("reportResults");
    if (!appointments.size) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">No revenue found for this criteria.</td></tr>';
        return;
    }

    tbody.innerHTML = Array.from(appointments.values()).map((a, index) => `
        <tr>
            <td class="text-muted">${index + 1}</td>
            <td><strong>${a.service_name}</strong></td>
            <td class="text-center">${a.appointmentCount}</td>
            <td class="text-right"><strong>฿${a.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
        </tr>
    `).join("");
}
