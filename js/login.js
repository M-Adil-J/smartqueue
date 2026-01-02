const roleSelect = document.getElementById("roleSelect");
const userFields = document.getElementById("userFields");
const adminFields = document.getElementById("adminFields");
const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");

// Hard-coded admin credentials
const ADMIN_CREDENTIALS = { name: "admin", password: "1234" };

roleSelect.addEventListener("change", () => {
  if (roleSelect.value === "user") {
    userFields.classList.remove("hidden");
    adminFields.classList.add("hidden");
  } else {
    userFields.classList.add("hidden");
    adminFields.classList.remove("hidden");
  }
});

loginBtn.addEventListener("click", () => {
  errorMsg.innerText = "";

  if (roleSelect.value === "user") {
    const name = document.getElementById("userName").value.trim();
    if (!name) return (errorMsg.innerText = "Enter your name");

    localStorage.setItem("userName", name);
    window.location.href = "index.html";
  } else {
    const name = document.getElementById("adminName").value.trim();
    const password = document.getElementById("adminPassword").value.trim();

    if (!name || !password)
      return (errorMsg.innerText = "Enter admin name and password");

    if (name === ADMIN_CREDENTIALS.name && password === ADMIN_CREDENTIALS.password) {
      window.location.href = "admin.html";
    } else {
      errorMsg.innerText = "Invalid admin credentials";
    }
  }
});
