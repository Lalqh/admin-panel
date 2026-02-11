function register() {

    const email = document.getElementById("reg_email").value.trim();
    const password = document.getElementById("reg_password").value;

    if (!email || !password) {
        showRegisterMessage("Todos los campos son obligatorios");
        return;
    }


    fetch("/api.php?controller=auth&action=register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
           
            email,
            password
        })
    })
    .then(res => res.json())
    .then(data => {

        if (data.success) {
            alert("Usuario registrado correctamente");
            loadView("login");
        } else {
            showRegisterMessage(data.message);
        }

    })
    .catch(() => {
        showRegisterMessage("Error de conexión");
    });
}

function showRegisterMessage(msg) {
    document.getElementById("registerMessage").innerText = msg;
}
