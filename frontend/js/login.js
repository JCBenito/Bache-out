
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
   INICIAR SESIÓN
================================= */

formulario.addEventListener("submit", async function (event) {

    event.preventDefault();

    const usuarioValor = usuario.value.trim();
    const passwordValor = password.value;

    // Limpiar el mensaje anterior.
    mensaje.textContent = "";
    mensaje.style.display = "none";
    mensaje.classList.remove("exito");

    // Validar el correo o teléfono.
    if (usuarioValor === "") {

        mostrarMensaje(
            "Ingresa tu correo electrónico o número telefónico."
        );

        usuario.focus();
        return;

    }

    // Validar la contraseña.
    if (passwordValor === "") {

        mostrarMensaje("Ingresa tu contraseña.");

        password.focus();
        return;

    }

    /*
       INTEGRACIÓN CON EL BACKEND

       Aquí tus compañeros deberán indicar la dirección
       del servicio de Python que valida las credenciales.

       No se deben aceptar las credenciales como correctas
       hasta recibir una respuesta válida del servidor.
    */

    botonLogin.disabled = true;
    botonLogin.textContent = "Verificando...";
    
    try {

        /*
        EJEMPLO PARA CUANDO TUS COMPAÑEROS TENGAN
        DISPONIBLE EL ENDPOINT DE INICIO DE SESIÓN.

        Sustituir la URL por la dirección real del backend.

        const respuesta = await fetch("URL_REAL_DEL_BACKEND", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario: usuarioValor,
                password: passwordValor
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                datos.mensaje || "Correo, teléfono o contraseña incorrectos."
            );
        }

        mostrarMensaje("Inicio de sesión correcto.", true);

        setTimeout(function () {

            if (datos.rol === "administrador") {
                window.location.href = "Administrador/resumen.html";
            } else if (datos.rol === "ciudadano") {
                window.location.href = "Index.html";
            } else {
                mostrarMensaje("El servidor devolvió un rol no válido.");
                botonLogin.disabled = false;
                botonLogin.textContent = "Iniciar sesión";
            }

        }, 800);

        */

        mostrarMensaje(
            "El formulario está listo. Falta conectar el servicio de inicio de sesión."
        );

    } catch (error) {

        mostrarMensaje(
            error.message || "No fue posible iniciar sesión. Inténtalo nuevamente."
        );

    } finally {

        botonLogin.disabled = false;
        botonLogin.textContent = "Iniciar sesión";

    }

});
