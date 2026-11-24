// ========================================
// ELEMENTOS DEL FORMULARIO
// ========================================

const formulario = document.getElementById("formularioLogin");
const usuario = document.getElementById("usuario");
const password = document.getElementById("password");
const mostrarPassword = document.getElementById("mostrarPassword");
const mensaje = document.getElementById("mensaje");
const botonLogin = formulario.querySelector('button[type="submit"]');

// Contador de intentos incorrectos
let intentosFallidos = Number(sessionStorage.getItem("intentosFallidos")) || 0;
const MAX_INTENTOS = 3;

// Roles administrativos: 1 Admin BBDD, 2 Project Manager, 3 Backend, 4 Frontend 1, 5 Frontend 2; 6 Ciudadano
const ROLES_ADMIN = [1, 2, 3, 4, 5, 6];


// ========================================
// MOSTRAR / OCULTAR CONTRASEÑA
// ========================================

mostrarPassword.addEventListener("click", function () {
    if (password.type === "password") {
        password.type = "text";
        mostrarPassword.textContent = "Ocultar";
    } else {
        password.type = "password";
        mostrarPassword.textContent = "Mostrar";
    }
});


// ========================================
// MOSTRAR MENSAJES
// ========================================

function mostrarMensaje(texto, esExito = false) {
    mensaje.textContent = texto;
    mensaje.style.display = "block";
    mensaje.classList.toggle("exito", esExito);
}


// ========================================
// INICIAR SESIÓN CON LA BASE DE DATOS
// ========================================

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

        let datos = {};

        try {
            const textoRespuesta = await respuesta.text();
            datos = textoRespuesta ? JSON.parse(textoRespuesta) : {};
        } catch (error) {
            throw new Error("El servidor devolvió una respuesta no válida.");
        }

        // =================================
        // CREDENCIALES INCORRECTAS
        // =================================

        if (respuesta.status === 401 || (respuesta.status === 400 && datos.error && !datos.usuario)) {

            intentosFallidos++;
            sessionStorage.setItem("intentosFallidos", intentosFallidos);

            if (intentosFallidos >= MAX_INTENTOS) {
                sessionStorage.setItem("correoVerificacion", usuarioValor);

                alert(
                    "Has superado el límite de intentos de inicio de sesión.\n\n" +
                    "Por seguridad, necesitas verificar tu identidad mediante tu correo electrónico.\n\n" +
                    "Presiona Aceptar para continuar."
                );

                window.location.href = "verificacion_correo.html";
                return;
            }

            mostrarMensaje(datos.error || "Correo o contraseña incorrectos.");

            botonLogin.disabled = false;
            botonLogin.textContent = "Iniciar sesión";

            return;
        }

        // Otros errores del servidor
        if (!respuesta.ok) {
            throw new Error(datos.error || "No fue posible iniciar sesión.");
        }

        // =================================
        // INICIO DE SESIÓN EXITOSO
        // =================================

        sessionStorage.removeItem("intentosFallidos");
        sessionStorage.setItem("sesionIniciada", "true");

        const usuarioData = datos.usuario || {};
        const rolId = Number(usuarioData.id_rol);
        const esAdmin = ROLES_ADMIN.includes(rolId);

        localStorage.setItem("usuario", JSON.stringify(usuarioData));
        localStorage.setItem("nombreUsuario", usuarioData.nombres || "");

        // Si en tus pantallas de admin lees "admin" o "rol", también queda disponible
        if (esAdmin) {
            localStorage.setItem("admin", JSON.stringify(usuarioData));
        } else {
            localStorage.removeItem("admin");
        }

        mostrarMensaje("¡Inicio de sesión exitoso! Redirigiendo...", true);

        // Cambia "admin.html" por el nombre exacto de tu archivo HTML principal del administrador
        const destino = esAdmin ? "administrador.html" : "index.html";

        setTimeout(() => {
            window.location.href = destino;
        }, 1000);

    } catch (error) {

        mostrarMensaje(error.message || "No fue posible iniciar sesión.");

        botonLogin.disabled = false;
        botonLogin.textContent = "Iniciar sesión";
    }

});
