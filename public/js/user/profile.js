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
  try {
    await renderUserProfile();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    showSnackbar(
      "Failed to load user profile. Please try again later.",
      error.response?.data?.error || error.message,
      "error",
    );
  }
});

async function renderUserProfile() {
  console.log("test");

  const response = await axios.get("/api/user/profile");
  const user = response.data;

  const card = document.getElementById("card");

  card.innerHTML = `
      <div class="profile-view">
          <h3>Personal Information</h3>
          <div class="profile-info-grid">
              <p><strong>Full Name</strong> <span>${user.first_name} ${user.last_name}</span></p>
              <p><strong>Citizen ID</strong> <span>${user.citizen_id}</span></p>
              <p><strong>Phone Number</strong> <span>${user.phone}</span></p>
              <p><strong>Email Address</strong> <span>${user.email}</span></p>
          </div>
          <div class="profile-actions">
              <button id="editProfileBtn" class="btn-primary">Edit Profile</button>
              <button onclick="ResetPassword()" class="btn-secondary">Change Password</button>
          </div>
      </div>
  `;

  document
    .getElementById("editProfileBtn")
    .addEventListener("click", () => editProfile(user));
}

function editProfile(user) {
  const card = document.getElementById("card");
  card.innerHTML = `
      <h3>Edit Profile</h3>
      <form id="editProfileForm" class="profile-form">
          <div class="form-row">
              <div class="form-group">
                  <label>First Name</label>
                  <input type="text" name="first_name" value="${user.first_name}" required minlength="2">
              </div>
              <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" name="last_name" value="${user.last_name}" required minlength="2">
              </div>
          </div>
          <div class="form-group">
              <label>Citizen ID</label>
              <input type="text" name="citizen_id" value="${user.citizen_id}" required maxlength="13">
          </div>
          <div class="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value="${user.phone}" required maxlength="10">
          </div>
          <div class="form-group">
              <label>Email (Account ID)</label>
              <input type="email" name="email" value="${user.email}" disabled class="input-disabled">
          </div>
          <div class="profile-actions">
              <button type="submit" class="btn-primary">Save Changes</button>
              <button type="button" onclick="location.reload()" class="btn-secondary">Cancel</button>
          </div>
      </form>
  `;

  const form = document.getElementById("editProfileForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!/^\d{13}$/.test(data.citizen_id)) {
      return showSnackbar("Invalid Citizen ID", "Must be 13 digits", "error");
    }

    if (data.first_name.length < 2 || data.last_name.length < 2) {
      return showSnackbar(
        "Invalid name",
        "Name must be at least 2 characters",
        "error",
      );
    }

    if (!/^\d{9,10}$/.test(data.phone)) {
      return showSnackbar(
        "Invalid phone number",
        "Phone must be 9-10 digits",
        "error",
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return showSnackbar("Invalid email format", "", "error");
    }

    try {
      await axios.put("/api/user/profile", data);
      showSnackbar("Profile updated successfully!");
      location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      showSnackbar(
        "Failed to update profile. Please try again.",
        error.response?.data?.error || error.message,
        "error",
      );
    }
  });
}

function ResetPassword() {
  const card = document.getElementById("card");
  card.innerHTML = `
      <h3>Change Password</h3>
      <form id="changePasswordForm" class="profile-form">
          <div class="form-group">
              <label>Current Password</label>
              <input type="password" name="current_password" required placeholder="Enter current password">
          </div>
          <div class="form-group">
              <label>New Password</label>
              <input type="password" name="new_password" required minlength="6" placeholder="Enter new password">
          </div>
          <div class="form-group">
              <label>Confirm New Password</label>
              <input type="password" name="confirm_password" required minlength="6" placeholder="Confirm new password">
          </div>
          <div class="profile-actions">
              <button type="submit" class="btn-primary">Change Password</button>
              <button type="button" onclick="location.reload()" class="btn-secondary">Cancel</button>
          </div>
      </form>
  `;

  const form = document.getElementById("changePasswordForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    if (data.new_password.length < 6) {
      showSnackbar(
        "New password must be at least 6 characters long.",
        "",
        "error",
      );
      return;
    }
    if (data.new_password !== data.confirm_password) {
      showSnackbar("New password and confirmation do not match.", "", "error");
      return;
    }
    try {
      await axios.post("/api/user/profile/change-password", data);
      showSnackbar("Password changed successfully!");
      location.reload();
    } catch (error) {
      console.error("Error changing password:", error);
      showSnackbar(
        "Failed to change password. Please try again.",
        error.response?.data?.error || error.message,
        "error",
      );
    }
  });
}
