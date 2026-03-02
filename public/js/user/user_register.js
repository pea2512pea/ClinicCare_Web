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
  const container = document.getElementById("register-form-container");
  container.innerHTML = `
        <div class="page-wrapper">
            <div class="clinic-info">
                <div class="badge">Health First</div>
                <h1>Join Clinic Care</h1>
                <p>Register today to book appointments, view your medical history, and connect with our specialists instantly.</p>
                
                <ul class="features-list">
                    <li><span>✓</span> Fast Online Booking</li>
                    <li><span>✓</span> 24/7 Access to Records</li>
                    <li><span>✓</span> Secure & Private</li>
                </ul>
            </div>

            <form id="register-form" class="form-container">
                <div class="form-header">
                    <h2>Patient Registration</h2>
                </div>

                <div class="form-group">
                    <label class="form-label">Citizen ID</label>
                    <input type="text" name="citizen_id" required placeholder="13-digit ID Number" maxlength="13">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">First Name</label>
                        <input type="text" name="first_name" required placeholder="First Name" minlength="2">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Last Name</label>
                        <input type="text" name="last_name" required placeholder="Last Name" minlength="2">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Phone</label>
                    <input type="tel" name="phone" required placeholder="08x-xxx-xxxx" maxlength="10">
                </div>

                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" name="email" required placeholder="name@example.com">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" name="password" required placeholder="Min 6 chars" minlength="6">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Confirm</label>
                        <input type="password" name="confirm_password" required placeholder="Confirm" minlength="6">
                    </div>
                </div>

                <button type="submit" class="btn-submit">Create Account</button>
                <p class="login-link">Already a patient? <a href="/user/login">Login here</a></p>
            </form>
        </div>
    `;
  document
    .getElementById("register-form")
    .addEventListener("submit", handleRegister);
});

function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const citizen_id = formData.get("citizen_id").trim();
  const first_name = formData.get("first_name").trim();
  const last_name = formData.get("last_name").trim();
  const phone = formData.get("phone").trim();
  const email = formData.get("email").trim();
  const password = formData.get("password").trim();
  const confirm_password = formData.get("confirm_password").trim();

  if (!/^\d{13}$/.test(citizen_id)) {
    return showSnackbar("Invalid Citizen ID", "Must be 13 digits", "error");
  }

  if (first_name.length < 2 || last_name.length < 2) {
    return showSnackbar(
      "Invalid name",
      "Name must be at least 2 characters",
      "error",
    );
  }

  if (!/^\d{9,10}$/.test(phone)) {
    return showSnackbar(
      "Invalid phone number",
      "Phone must be 9-10 digits",
      "error",
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return showSnackbar("Invalid email format", "", "error");
  }

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

  if (!email || !password) {
    showSnackbar("Please enter both email and password.", "", "error");
    return;
  }
  const payload = {
    citizen_id,
    first_name,
    last_name,
    phone,
    email,
    password,
  };

  try {
    axios
      .post("/api/auth/register-patient", payload)
      .then((response) => {
        const data = response.data;
        if (data && data.message) {
          alert("Registration successful!");
          window.location.href = "/";
        } else {
          alert("Invalid response from server.");
        }
      })
      .catch((error) => {
        console.log(error.response);

        showSnackbar(
          "Registration failed. Please check your input and try again. ",
          error.response?.data?.error || error.message,
          "error",
        );
      });
  } catch (error) {
    console.error("Unexpected error:", error);
    showSnackbar(
      "An unexpected error occurred. Please try again later.",
      "",
      "error",
    );
  }
}
