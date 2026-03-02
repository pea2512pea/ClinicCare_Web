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
  const container = document.getElementById("login-form-container");
  container.innerHTML = `
        <div class="page-wrapper">
            <div class="clinic-info staff">
                <div class="badge">Staff Portal</div>
                <h1>Welcome Back</h1>
                <p>Log in to manage appointments, view patient records, and coordinate care efficiently.</p>
                <div class="info-graphic">
                    <div class="calendar-icon">🔒</div>
                </div>
            </div>
            <form id="login-form" class="form-container">
                <div class="form-header">
                    <h2>Login</h2>
                    <p>Enter your credentials to access your account</p>
                </div>
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" name="username" required placeholder="Enter your username">
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" name="password" required placeholder="Enter your password">
                </div>
                <button type="submit" class="btn-submit">Sign In</button>
            </form>
        </div>
    `;
  document.getElementById("login-form").addEventListener("submit", handleLogin);
});

function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const user_name = formData.get("username").trim();
  const password = formData.get("password").trim();

  if (!user_name || !password) {
    showSnackbar("Please enter both username and password.", "", "error");
    return;
  }
  const payload = {
    user_name,
    password,
  };

  try {
    axios
      .post("/api/auth/staff", payload)
      .then((response) => {
        const data = response.data;
        if (data && data.token) {
          window.location.href = "/";
        } else {
          showSnackbar("Invalid response from server.", "", "error");
        }
      })
      .catch((error) => {
        showSnackbar(
          "Login failed. Please check your credentials and try again.",
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

// <div class="page-wrapper">
//     <div class="clinic-info">
//         <div class="badge">Patient Portal</div>
//         <h1>Welcome Back</h1>
//         <p>Log in to manage your appointments, check test results, and message your doctor securely.</p>

//         <div class="info-graphic">
//             <div class="calendar-icon">📅</div>
//         </div>
//     </div>

//     <form id="login-form" class="form-container">
//         <div class="form-header">
//             <h2>Login</h2>
//             <p>Enter your credentials to access your account</p>
//         </div>

//         <div class="form-group">
//             <label class="form-label">Email Address</label>
//             <input type="email" name="email" required placeholder="name@example.com">
//         </div>

//         <div class="form-group">
//             <label class="form-label">Password</label>
//             <input type="password" name="password" required placeholder="Enter your password">
//             <div class="forgot-pass">
//                 <p>If you forgot your password, please contact our support team.</p>
//             </div>
//         </div>

//         <button type="submit" class="btn-submit">Sign In</button>

//         <div class="form-footer">
//             <p class="login-link">Don't have an account? <a href="/register">Register here</a></p>
//         </div>
//     </form>
// </div>
