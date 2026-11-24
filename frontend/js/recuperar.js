/* =========================================
   RECUPERAR CONTRASEÑA (VERIFICACIÓN REAL)
   ========================================= */

const formularioRecuperar = document.getElementById("formularioRecuperar");
const datoUsuario = document.getElementById("datoUsuario");
const mensajeError = document.getElementById("mensajeError");
const botonContinuar = formularioRecuperar.querySelector(".btn-continuar");

// Bloquear puntos, símbolos o espacios al inicio mientras escribe
if (datoUsuario) {
    datoUsuario.addEventListener("input", function () {
        this.value = this.value.replace(/^[^a-zA-Z0-9]+/, "").replace(/\s/g, "");
    });
}

formularioRecuperar.addEventListener("submit", async function (event) {
    event.preventDefault();

    const correo = datoUsuario.value.trim().toLowerCase();

    /* LIMPIAR MENSAJE */
    mensajeError.textContent = "";
    mensajeError.style.display = "none";
    datoUsuario.classList.remove("error");

    /* VALIDAR CAMPO VACÍO */
    if (correo === "") {
        mostrarError("Ingresa tu correo electrónico registrado.");
        datoUsuario.focus();
        return;
    }

    /* VALIDAR FORMATO DE CORREO */
    if (!correo.includes("@") || !correo.includes(".")) {
        mostrarError("Ingresa un correo electrónico válido (ej. ejemplo@gmail.com).");
        datoUsuario.focus();
        return;
    }

    /* DESHABILITAR BOTÓN MIENTRAS VERIFICA EN EL SERVIDOR */
    if (botonContinuar) {
        botonContinuar.disabled = true;
        botonContinuar.textContent = "Verificando...";
    }

    try {
        // Verifica en PostgreSQL si el correo existe y envía el código de 6 dígitos
        const respuesta = await fetch("/api/recuperar-solicitar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ correo })
        });

        const datos = await respuesta.json();

        // Si el correo NO está registrado en la base de datos (404) o falla el envío
        if (!respuesta.ok) {
            throw new Error(datos.error || "El correo electrónico no está registrado en Bache-Out.");
        }

        // Guardamos el correo verificado en sessionStorage para usarlo en la siguiente página
        sessionStorage.setItem("correoRecuperacion", correo);
       // Identificar que el motivo es recuperar contraseña
       sessionStorage.setItem("motivoVerificacion", "recuperacion");

        // Redirige a la pantalla donde se ingresa el código y la nueva contraseña
        // (Cambia "verificacion_codigo.html" por "contraseña.html" si ese es el nombre que usarás)
        window.location.href = "verificacion_codigo.html";

    } catch (error) {
        mostrarError(error.message || "No se pudo verificar el correo.");

        if (botonContinuar) {
            botonContinuar.disabled = false;
            botonContinuar.textContent = "Continuar";
        }
    }
});

/* =========================================
   MOSTRAR ERROR
   ========================================= */

function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.style.display = "block";
    datoUsuario.classList.add("error");
}
