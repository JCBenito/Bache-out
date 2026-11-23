/* =========================================
   NUEVA CONTRASEÑA (CONEXIÓN REAL CON SERVIDOR)
   BACHE-OUT
   ========================================= */

const formularioNueva = document.getElementById("formularioNueva");
const nuevaContrasena = document.getElementById("nuevaContrasena");
const confirmarContrasena = document.getElementById("confirmarContrasena");
const mensajeError = document.getElementById("mensajeError");
const botonGuardar = formularioNueva ? formularioNueva.querySelector('button[type="submit"]') : null;

const correoGuardado = sessionStorage.getItem("correoRecuperacion");
const codigoGuardado = sessionStorage.getItem("codigoRecuperacion");

// Si el usuario entra directo sin haber validado su correo y código antes, regresarlo
if (!correoGuardado || !codigoGuardado) {
    alert("Debes verificar tu correo y código de seguridad primero.");
    window.location.href = "recuperar.html";
}

/* =========================================
   ENVIAR FORMULARIO
   ========================================= */

formularioNueva.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nueva = nuevaContrasena.value.trim();
    const confirmacion = confirmarContrasena.value.trim();

    /* LIMPIAR ERRORES */
    mensajeError.textContent = "";
    mensajeError.style.display = "none";
    nuevaContrasena.classList.remove("error");
    confirmarContrasena.classList.remove("error");

    /* 1. CAMPOS VACÍOS */
    if (nueva === "" || confirmacion === "") {
        mostrarError("Todos los campos son obligatorios.");
        return;
    }

    /* 2. MÍNIMO 8 CARACTERES */
    if (nueva.length < 8) {
        mostrarError("La contraseña debe tener mínimo 8 caracteres.");
        nuevaContrasena.focus();
        return;
    }

    /* 3. AL MENOS UN NÚMERO */
    if (!/[0-9]/.test(nueva)) {
        mostrarError("La contraseña debe contener al menos un número.");
        nuevaContrasena.focus();
        return;
    }

    /* 4. AL MENOS UN SÍMBOLO */
    if (!/[^A-Za-z0-9]/.test(nueva)) {
        mostrarError("La contraseña debe contener al menos un símbolo.");
        nuevaContrasena.focus();
        return;
    }

    /* 5. COMPROBAR QUE COINCIDAN */
    if (nueva !== confirmacion) {
        mostrarError("Las contraseñas no coinciden.");
        confirmarContrasena.focus();
        return;
    }

    const textoOriginal = botonGuardar ? botonGuardar.textContent : "Guardar contraseña";
    if (botonGuardar) {
        botonGuardar.disabled = true;
        botonGuardar.textContent = "Actualizando...";
    }

    try {
        /* 6. ENVIAR AL SERVIDOR PARA ACTUALIZAR EN POSTGRESQL */
        const respuesta = await fetch("/api/recuperar-restablecer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo: correoGuardado,
                codigo: codigoGuardado,
                nuevaContrasena: nueva
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error || "No se pudo actualizar la contraseña.");
        }

        /* 7. LIMPIAR DATOS TEMPORALES DE RECUPERACIÓN */
        sessionStorage.removeItem("correoRecuperacion");
        sessionStorage.removeItem("codigoRecuperacion");

        alert("La contraseña se actualizó correctamente. Ya puedes iniciar sesión.");
        window.location.href = "login.html";

    } catch (error) {
        mostrarError(error.message || "Error al conectar con el servidor.");
        if (botonGuardar) {
            botonGuardar.disabled = false;
            botonGuardar.textContent = textoOriginal;
        }
    }
});

/* =========================================
   MOSTRAR ERROR
   ========================================= */

function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.style.display = "block";
    nuevaContrasena.classList.add("error");
    confirmarContrasena.classList.add("error");
}
