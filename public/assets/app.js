document.addEventListener("DOMContentLoaded", () => {
  handleRoute();
});

function checkAuth() {
  fetch("api.php?controller=auth&action=me")
    .then((res) => {
      if (res.status === 401) {
        loadView("login");
        return null;
      }

      return res.json();
    })
    .then((data) => {
      if (data && data.success) {
        loadView("dashboard");
      }
    })
    .catch((ex) => {
      console.error("Error al verificar autenticación:", ex);
      loadView("login");
    });
}

function handleRoute() {
  const path = window.location.pathname.toLowerCase();

  if (path === "/register") {
    loadView("register");
  } else {
    checkAuth();
  }
}
