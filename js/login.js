// ================================
// ELEMENTOS DEL FORMULARIO
// ================================

const formulario = document.getElementById("formularioLogin");
const usuario = document.getElementById("usuario");
const password = document.getElementById("password");
const mostrarPassword = document.getElementById("mostrarPassword");
const mensaje = document.getElementById("mensaje");


// ================================
// MOSTRAR / OCULTAR CONTRASEÑA
// ================================

mostrarPassword.addEventListener("click", function () {

    if (password.type === "password") {

        password.type = "text";
        mostrarPassword.textContent = "Ocultar";

    } else {

        password.type = "password";
        mostrarPassword.textContent = "Mostrar";

    }

});


// ================================
// VALIDAR Y PROCESAR INICIO DE SESIÓN
// ================================

formulario.addEventListener("submit", function (event) {

    // Evita que la página se recargue
    event.preventDefault();

    const usuarioValor = usuario.value.trim();
    const passwordValor = password.value;


    // ================================
    // LIMPIAR MENSAJE ANTERIOR
    // ================================

    mensaje.textContent = "";
    mensaje.style.display = "none";
    mensaje.classList.remove("exito");


    // ================================
    // VALIDAR USUARIO
    // ================================

    if (usuarioValor === "") {

        mensaje.textContent =
            "Error: ingresa tu correo electrónico o teléfono";

        mensaje.style.display = "block";

        usuario.focus();

        return;
    }


    // ================================
    // VALIDAR CONTRASEÑA
    // ================================

    if (passwordValor === "") {

        mensaje.textContent =
            "Error: ingresa tu contraseña";

        mensaje.style.display = "block";

        password.focus();

        return;
    }


    // ================================
    // PETICIÓN A LA API (BACKEND / DB)
    // ================================

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            usuario: usuarioValor,
            contrasena: passwordValor
        })
    })
    .then(function (respuesta) {
        return respuesta.json();
    })
    .then(function (data) {
        if (data.error) {
            mensaje.textContent = "Error: " + data.error;
            mensaje.style.display = "block";
        } else {
            // Guardar datos del usuario en la sesión local
            sessionStorage.setItem("sesionIniciada", "true");
            if (data.usuario) {
                sessionStorage.setItem("usuarioId", data.usuario.id);
                sessionStorage.setItem("usuarioNombre", data.usuario.nombre);
            }

            mensaje.classList.add("exito");
            mensaje.textContent = "✓ Inicio de sesión exitoso. Redirigiendo...";
            mensaje.style.display = "block";

            setTimeout(function () {
                window.location.href = "Reporte.html";
            }, 1000);
        }
    })
    .catch(function (error) {
        mensaje.textContent = "Error al conectar con el servidor. Intenta de nuevo.";
        mensaje.style.display = "block";
    });

});
