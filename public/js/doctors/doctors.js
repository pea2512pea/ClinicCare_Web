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

async function fetchDoctors(page = 1) {
  try {
    const response = await axios.get(
      `/api/admin/doctors?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    );
    const { doctors, totalPages } = response.data;
    currentPage = page;
    renderDoctors(doctors);
    renderPagination(totalPages);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    showSnackbar(
      "Failed to fetch doctors.",
      error.response?.data?.error || error.message,
      "error",
    );
  }
}

function deleteDoctor(id) {
  if (confirm("Are you sure you want to delete this doctor?")) {
    axios
      .delete(`/api/admin/doctors/${id}`)
      .then(() => {
        showSnackbar("Doctor deleted successfully.", "", "success");
        fetchDoctors(currentPage);
      })
      .catch((error) => {
        console.error("Error deleting doctor:", error);
        showSnackbar(
          "Failed to delete doctor.",
          error.response?.data?.error || error.message,
          "error",
        );
      });
  }
}

function renderDoctors(doctors) {
  const tableBody = document.getElementById("doctors-table");
  tableBody.innerHTML = "";

  if (doctors.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 40px; color: #64748b;">No doctors found matching your criteria.</td></tr>`;
    return;
  }

  doctors.forEach((doctor) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td><code>${doctor.citizen_id}</code></td>
            <td>
                <strong>Dr. ${doctor.first_name} ${doctor.last_name}</strong>
            </td>
            <td>
                <span class="specialty-badge">${doctor.specialty}</span>
            </td>
            <td>
                <div class="contact-cell">
                    <span>${doctor.phone}</span>
                    <small>${doctor.email}</small>
                </div>
            </td>
            <td>
                <span class="role-tag role-${doctor.role.toLowerCase()}">${doctor.role}</span>
            </td>
            <td class="text-right">
                <div class="row-actions">
                    <a href="/admin/doctors/${doctor.id}" class="action-link">View</a>
                    <a href="/admin/doctors-edit/${doctor.id}" class="action-link">Edit</a>
                    <button onclick="deleteDoctor(${doctor.id})" class="action-link delete">Delete</button>
                </div>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

function renderPagination(totalPages) {
  const paginationDiv = document.getElementById("pagination");
  paginationDiv.innerHTML = `<span>Page ${currentPage} of ${totalPages}</span>`;

  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.className = "btn-pagination";
    prevBtn.textContent = "Previous";
    prevBtn.onclick = () => fetchDoctors(currentPage - 1);
    paginationDiv.prepend(prevBtn);
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn-pagination";
    nextBtn.textContent = "Next";
    nextBtn.onclick = () => fetchDoctors(currentPage + 1);
    paginationDiv.appendChild(nextBtn);
  }
}

function handleSearch(event) {
  event.preventDefault();
  const searchInput = document.querySelector('input[name="search"]');
  searchQuery = searchInput.value.trim();
  fetchDoctors(1);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchDoctors();
});
