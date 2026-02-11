function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showLoginMessage("Todos los campos son obligatorios");
    return;
  }

  fetch("/api.php?controller=auth&action=login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Usuario logueado correctamente");
        loadView("dashboard");
      } else {
        showLoginMessage(data.message);
      }
    })
    .catch((ex) => {
      console.error("Error en login:", ex);
      showLoginMessage("Error de conexión");
    });
}

function showLoginMessage(msg) {
  document.getElementById("loginMessage").innerText = msg;
}
