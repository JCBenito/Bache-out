// =========================================
// ENVÍO Y VERIFICACIÓN REAL DEL CORREO REGISTRADO
// =========================================

const formulario = document.querySelector("form");
const correoInput = document.querySelector('input[type="email"], input[type="text"]');
const botonEnviar = formulario ? formulario.querySelector('button[type="submit"]') : null;

// Bloquear espacios y caracteres inválidos al inicio mientras escribe
if (correoInput) {
    correoInput.addEventListener("input", function () {
        this.value = this.value.replace(/^[^a-zA-Z0-9]+/, "").replace(/\s/g, "");
    });
}

if (formulario) {
    formulario.addEventListener("submit", async function (event) {
        event.preventDefault();

        const correo = correoInput ? correoInput.value.trim().toLowerCase() : "";

        // 1. Validar que se haya escrito un correo
        if (correo === "") {
            alert("Por favor, ingresa tu correo electrónico.");
            if (correoInput) correoInput.focus();
            return;
        }

        // 2. Validar formato básico de correo
        if (!correo.includes("@") || !correo.includes(".")) {
            alert("Por favor, ingresa un correo electrónico válido.");
            if (correoInput) correoInput.focus();
            return;
        }

        const textoOriginal = botonEnviar ? botonEnviar.textContent : "Continuar";
        if (botonEnviar) {
            botonEnviar.disabled = true;
            botonEnviar.textContent = "Verificando...";
        }

        try {
            // 3. Consultar al backend (/api/recuperar-solicitar) si el correo está registrado
            const respuesta = await fetch("/api/recuperar-solicitar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    correo,
                    motivo: "desbloqueo"
                })
            });

            const datos = await respuesta.json();

            // Si el correo NO existe en PostgreSQL (404) o hay error, detener aquí
            if (!respuesta.ok) {
                alert(datos.error || "Este correo electrónico no está registrado en Bache-Out.");
                if (botonEnviar) {
                    botonEnviar.disabled = false;
                    botonEnviar.textContent = textoOriginal;
                }
                return;
            }

            // 4. Guardar el correo verificado en sessionStorage para la pantalla del código
            sessionStorage.setItem("correoRecuperacion", correo);
            // Identificar que el motivo es desbloquear la cuenta
            sessionStorage.setItem("motivoVerificacion", "desbloqueo");

            alert(
                "Hemos enviado un código de verificación de 6 dígitos a tu correo electrónico. " +
                "Por favor, revisa tu bandeja de entrada o la sección de SPAM."
            );

            // 5. Redirigir a la pantalla de verificación de código
            window.location.href = "verificacion_codigo.html";

        } catch (error) {
            console.error("Error al verificar correo:", error);
            alert("No se pudo conectar con el servidor para verificar el correo.");
            if (botonEnviar) {
                botonEnviar.disabled = false;
                botonEnviar.textContent = textoOriginal;
            }
        }
    });
}
