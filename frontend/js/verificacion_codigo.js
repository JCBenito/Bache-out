// =========================================
// VERIFICACIÓN REAL DEL CÓDIGO DE 6 DÍGITOS
// =========================================

const formulario = document.getElementById("formularioCodigo") || document.querySelector("form");
const campoCodigo = document.getElementById("codigo") || document.querySelector('input[type="text"]');
const mensajeDiv = document.getElementById("mensaje");
const botonVerificar = formulario.querySelector('button[type="submit"]');

const correoGuardado = sessionStorage.getItem("correoRecuperacion");

// Si el usuario entra directo a esta página sin haber validado su correo antes, regresarlo
if (!correoGuardado) {
    alert("Primero debes ingresar tu correo electrónico registrado.");
    window.location.href = "recuperar.html";
}

// Bloquear letras o símbolos en tiempo real y limitar exactamente a 6 números
if (campoCodigo) {
    campoCodigo.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 6);
    });
}

function mostrarMensaje(texto, esExito = false) {
    if (!mensajeDiv) {
        alert(texto);
        return;
    }
    mensajeDiv.textContent = texto;
    mensajeDiv.style.display = "block";
    mensajeDiv.style.color = esExito ? "#16a34a" : "#dc2626";
}

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const codigo = campoCodigo.value.trim();

    if (mensajeDiv) {
        mensajeDiv.textContent = "";
        mensajeDiv.style.display = "none";
    }

    // 1. Validar que se hayan ingresado exactamente 6 dígitos numéricos
    if (!/^\d{6}$/.test(codigo)) {
        mostrarMensaje("Ingresa un código válido de 6 dígitos numéricos.");
        campoCodigo.focus();
        return;
    }

    if (botonVerificar) {
        botonVerificar.disabled = true;
        botonVerificar.textContent = "Verificando...";
    }

    try {
        // 2. Verificar en el servidor que el código coincida con el enviado a ese correo
        const respuesta = await fetch("/api/recuperar-verificar-codigo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo: correoGuardado,
                codigo: codigo
            })
        });

        const datos = await respuesta.json();

        // Si el código es incorrecto o ya expiró, detener aquí y mostrar error
        if (!respuesta.ok) {
            throw new Error(datos.error || "El código ingresado es incorrecto.");
        }

        // 3. Guardar el código validado en sessionStorage para la pantalla de nueva contraseña
      
        // 3. Guardar el código validado
        sessionStorage.setItem("codigoRecuperacion", codigo);

        // 4. Obtener el motivo directamente del servidor
        const motivo = datos.motivo;

        mostrarMensaje("¡Código verificado correctamente! Redirigiendo...", true);

        setTimeout(() => {

            if (motivo === "recuperacion") {

                window.location.href = "contraseña.html";

            } else if (motivo === "desbloqueo") {

                // Limpiar los datos temporales del desbloqueo
                sessionStorage.removeItem("motivoVerificacion");
                sessionStorage.removeItem("correoRecuperacion");
                sessionStorage.removeItem("codigoRecuperacion");
                sessionStorage.removeItem("intentosFallidos");

                window.location.href = "login.html";

            } else {

                alert("No se pudo identificar el motivo de la verificación.");
                window.location.href = "login.html";

            }

        }, 1200);


    } catch (error) {
        mostrarMensaje(error.message || "Error al verificar el código.", false);

        if (botonVerificar) {
            botonVerificar.disabled = false;
            botonVerificar.textContent = "Verificar código";
        }
    }
});
