function handleLogout() {
  axios.post("/api/auth/logout").then(response => {
    window.location.href = "/portal";
  }).catch(error => {
    console.error("Error during logout:", error);
    alert("Failed to logout. Please try again.");
  });
}