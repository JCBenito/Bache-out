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
// VALIDAR INICIO DE SESIÓN
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
            "Error: ingresa tu correo electrónico o número telefónico.";

        mensaje.style.display = "block";

        usuario.focus();

        return;
    }


    // ================================
    // VALIDAR CONTRASEÑA
    // ================================

    if (passwordValor === "") {

        mensaje.textContent =
            "Error: ingresa tu contraseña.";

        mensaje.style.display = "block";

        password.focus();

        return;
    }


    // ================================
    // DATOS CORRECTOS
    // ================================

    mensaje.classList.add("exito");

    mensaje.textContent =
        "Inicio de sesión correcto. Redirigiendo al mapa...";

    mensaje.style.display = "block";


    // ================================
    // IR AL MAPA INTERACTIVO
    // ================================

    setTimeout(function () {

        window.location.href = "Index.html";

    }, 1000);

    sessionStorage.setItem("sesionIniciada", "true");

    window.location.href = "Index.html";
});