document.getElementById("register-form").addEventListener("submit", handleRegister);

function showSnackbar(message, detail = "", type = "success") {
  const snackbar = document.getElementById("snackbar");
  snackbar.querySelector(".message").textContent = message;
  snackbar.querySelector(".detail").textContent = detail;
  snackbar.className = "snackbar show " + type;
  setTimeout(() => {
    snackbar.classList.remove("show");
    snackbar.classList.remove(type);
    snackbar.classList.remove("snackbar");
    snackbar.querySelector(".message").textContent = "";
    snackbar.querySelector(".detail").textContent = "";
  }, 3000);
}

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
