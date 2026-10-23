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
   INICIAR SESIÓN CON LA BASE DE DATOS
================================= */

formulario.addEventListener("submit", async function (event) {

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
        // Petición real al servidor backend en Node.js
        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: usuarioValor,
                contrasena: passwordValor
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error || "Credenciales incorrectas.");
        }

        // 👉 Guardamos la sesión con la clave correcta que piden las páginas protegidas
        sessionStorage.setItem("sesionIniciada", "true");
        sessionStorage.setItem("nombreUsuario", datos.usuario.nombre);

        mostrarMensaje("¡Inicio de sesión exitoso! Redirigiendo...", true);

        // Pequeña pausa para que se alcance a leer el mensaje y entra a la app
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch (error) {
        mostrarMensaje(error.message || "No fue posible iniciar sesión.");

        botonLogin.disabled = false;
        botonLogin.textContent = "Iniciar sesión";
    }

});
