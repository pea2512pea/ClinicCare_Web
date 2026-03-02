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

async function fetchPatients(page = 1) {
  try {
    const response = await axios.get(
      `/api/admin/patients?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
    );
    const { patients, totalPages } = response.data;
    currentPage = page;
    renderPatients(patients);
    renderPagination(totalPages);
  } catch (error) {
    console.error("Error fetching patients:", error);
    showSnackbar(
      "Failed to fetch patients.",
      error.response?.data?.error || error.message,
      "error",
    );
  }
}

function renderPatients(patients) {
  const tableBody = document.getElementById("patients-table");
  tableBody.innerHTML = patients.length
    ? ""
    : "<tr><td colspan='4'>No patients found.</td></tr>";

  patients.forEach((patient) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="id-badge">${patient.citizen_id}</span></td>
      <td><strong>${patient.first_name} ${patient.last_name}</strong></td>
      <td>
        <div class="contact-cell">
          <span>${patient.phone}</span>
          <small>${patient.email}</small>
        </div>
      </td>
      <td class="text-right">
        <div class="row-actions">
          <a href="/admin/patients/${patient.id}" class="action-link">View</a>
          <a href="/admin/patients-edit/${patient.id}" class="action-link">Edit</a>
          <button onclick="deletePatient(${patient.id})" class="action-link delete">Delete</button>
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
    prevBtn.onclick = () => fetchPatients(currentPage - 1);
    paginationDiv.prepend(prevBtn); // Put at start
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn-pagination";
    nextBtn.textContent = "Next";
    nextBtn.onclick = () => fetchPatients(currentPage + 1);
    paginationDiv.appendChild(nextBtn); // Put at end
  }
}

function deletePatient(id) {
  if (confirm("Are you sure you want to delete this patient?")) {
    axios
      .delete(`/api/admin/patients/${id}`)
      .then(() => {
        showSnackbar("Patient deleted successfully.", "", "success");
        fetchPatients(currentPage);
      })
      .catch((error) => {
        console.error("Error deleting patient:", error);
        showSnackbar(
          "Failed to delete patient.",
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
  fetchPatients(1);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchPatients();
});
