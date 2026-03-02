let currentPage = 1;
let limit = 5;
let searchQuery = "";

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

async function fetchServices(page = 1) {
  try {
    const response = await axios.get(
      `/api/admin/services?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    );
    const { services, totalPages } = response.data;
    currentPage = page;
    renderServices(services);
    renderPagination(totalPages);
  } catch (error) {
    console.error("Error fetching services:", error);
    showSnackbar(
      "Failed to fetch services.",
      error.response?.data?.error || error.message,
      "error",
    );
  }
}

function renderServices(services) {
  const tableBody = document.getElementById("services-table");
  tableBody.innerHTML = "";

  if (services.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 40px; color: #64748b;">No services found.</td></tr>`;
    return;
  }

  services.forEach((service) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>
                <div class="service-name-cell">
                    <strong>${service.service_name}</strong>
                </div>
            </td>
            <td>
                <span class="duration-badge">⏱ ${service.duration} mins</span>
            </td>
            <td>
                <span class="price-text">฿${Number(service.price).toLocaleString()}</span>
            </td>
            <td class="text-right">
                <div class="row-actions">
                    <a href="/admin/services/${service.id}" class="action-link">View</a>
                    <a href="/admin/services-edit/${service.id}" class="action-link">Edit</a>
                    <button onclick="deleteService(${service.id})" class="action-link delete">Delete</button>
                </div>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

function renderPagination(totalPages) {
  const paginationDiv = document.getElementById("pagination");
  paginationDiv.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.className = "btn-pagination";
  prevBtn.innerHTML = "← Previous";
  prevBtn.disabled = currentPage <= 1;
  prevBtn.onclick = () => fetchServices(currentPage - 1);

  const pageInfo = document.createElement("span");
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn-pagination";
  nextBtn.innerHTML = "Next →";
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.onclick = () => fetchServices(currentPage + 1);

  paginationDiv.appendChild(prevBtn);
  paginationDiv.appendChild(pageInfo);
  paginationDiv.appendChild(nextBtn);
}

function deleteService(id) {
  if (confirm("Are you sure you want to delete this service?")) {
    axios
      .delete(`/api/admin/services/${id}`)
      .then(() => {
        showSnackbar("Service deleted successfully.");
        fetchServices(currentPage);
      })
      .catch((error) => {
        console.error("Error deleting service:", error);
        showSnackbar(
          "Failed to delete service.",
          error.response?.data?.error || error.message,
          "error",
        );
      });
  }
}

function handleSearch(event) {
  event.preventDefault();
  const searchInput = document.querySelector('input[name="search"]');
  searchQuery = searchInput.value.trim();
  fetchServices(1);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchServices();
});
