
/* =================================
   ELEMENTOS DEL FORMULARIO
================================= */

const formulario = document.getElementById("formularioLogin");
const usuario = document.getElementById("usuario");
const password = document.getElementById("password");
const mostrarPassword = document.getElementById("mostrarPassword");
const mensaje = document.getElementById("mensaje");
const botonLogin = formulario.querySelector('button[type="submit"]');


/* =================================
   MOSTRAR / OCULTAR CONTRASEÑA
================================= */

mostrarPassword.addEventListener("click", function () {
    if (password.type === "password") {
        password.type = "text";
        mostrarPassword.textContent = "Ocultar";
    } else {
        password.type = "password";
        mostrarPassword.textContent = "Mostrar";
    }
});


/* =================================
   MOSTRAR MENSAJES
================================= */

function mostrarMensaje(texto, esExito = false) {
    mensaje.textContent = texto;
    mensaje.style.display = "block";
    mensaje.classList.toggle("exito", esExito);
}


/* =================================
   INICIAR SESIÓN TEMPORAL
================================= */

formulario.addEventListener("submit", function (event) {

    event.preventDefault();

    const usuarioValor = usuario.value.trim();
    const passwordValor = password.value;

    mensaje.textContent = "";
    mensaje.style.display = "none";
    mensaje.classList.remove("exito");

    if (usuarioValor === "") {
        mostrarMensaje("Ingresa tu correo electrónico o número telefónico.");
        usuario.focus();
        return;
    }

    if (passwordValor === "") {
        mostrarMensaje("Ingresa tu contraseña.");
        password.focus();
        return;
    }

    botonLogin.disabled = true;
    botonLogin.textContent = "Iniciando sesión...";

    try {

        // Guardar una sesión temporal para probar el frontend.
        sessionStorage.setItem("sesionActiva", "true");
        sessionStorage.setItem("usuarioBacheOut", usuarioValor);

        mostrarMensaje("Inicio de sesión correcto.", true);

        // Entrar a la página principal.
        window.location.href = "Index.html";

    } catch (error) {

        mostrarMensaje("No fue posible iniciar sesión.");

        botonLogin.disabled = false;
        botonLogin.textContent = "Iniciar sesión";

    }

});
