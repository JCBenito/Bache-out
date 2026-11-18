// ========================================
// ELEMENTOS DEL FORMULARIO
// ========================================

const formulario = document.getElementById("formularioRegistro");

const nombreInput = document.getElementById("nombre");
const apellidoPInput = document.getElementById("apellidoP");
const apellidoMInput = document.getElementById("apellidoM");
const correoInput = document.getElementById("correo");
const telefonoInput = document.getElementById("telefono");

const password = document.getElementById("password");
const confirmarPassword = document.getElementById("confirmarPassword");

const mostrarPassword = document.getElementById("mostrarPassword");
const mostrarConfirmar = document.getElementById("mostrarConfirmar");

const mensaje = document.getElementById("mensaje");
const botonRegistro = formulario.querySelector('button[type="submit"]');


// ========================================
// BLOQUEAR NÚMEROS Y CARACTERES EN TIEMPO REAL
// ========================================

[nombreInput, apellidoPInput, apellidoMInput].forEach(campo => {
    if (!campo) return;

    campo.addEventListener("input", function () {
        // Elimina automáticamente números y caracteres especiales, dejando solo letras, acentos, ñ y espacios
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "");
    });
});

// Bloquear puntos, símbolos o espacios al inicio del correo mientras el usuario escribe
if (correoInput) {
    correoInput.addEventListener("input", function () {
        this.value = this.value
            .replace(/^[^a-zA-Z0-9]+/, "") // Elimina puntos o símbolos al inicio
            .replace(/\s/g, "");            // Elimina espacios
    });
}


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
// MOSTRAR / OCULTAR CONFIRMACIÓN
// ========================================

mostrarConfirmar.addEventListener("click", function () {
    if (confirmarPassword.type === "password") {
        confirmarPassword.type = "text";
        mostrarConfirmar.textContent = "Ocultar";
    } else {
        confirmarPassword.type = "password";
        mostrarConfirmar.textContent = "Mostrar";
    }
});


// ========================================
// VALIDAR Y ENVIAR FORMULARIO
// ========================================

formulario.addEventListener("submit", async function (event) {

    // Evita que la página se recargue
    event.preventDefault();

    // ====================================
    // OBTENER DATOS
    // ====================================
    const nombres = nombreInput ? nombreInput.value.trim().replace(/\s+/g, " ") : "";
    const apellido_paterno = apellidoPInput ? apellidoPInput.value.trim().replace(/\s+/g, " ") : "";
    const apellido_materno = apellidoMInput ? apellidoMInput.value.trim().replace(/\s+/g, " ") : "";
    const correo = correoInput ? correoInput.value.trim().toLowerCase() : "";
    const telefono = telefonoInput.value.trim();
    
    const passwordValor = password.value;
    const confirmarValor = confirmarPassword.value;

    // Limpiar mensaje anterior
    mensaje.textContent = "";
    mensaje.style.display = "none";
    mensaje.classList.remove("exito");

    // ====================================
    // VALIDACIONES LOCALES ESTRICTAS
    // ====================================

    // 1. Validación de nombres y apellidos reales (solo letras, acentos, ñ y espacios; mínimo 2 letras)
    const regexSoloLetras = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]{2,50}$/;

    if (!regexSoloLetras.test(nombres)) {
        mostrarError("Error: el nombre solo debe contener letras reales (mínimo 2 caracteres, sin números ni símbolos).");
        nombreInput.focus();
        return;
    }

    if (!regexSoloLetras.test(apellido_paterno)) {
        mostrarError("Error: el apellido paterno solo debe contener letras reales.");
        apellidoPInput.focus();
        return;
    }

    if (apellido_materno !== "" && !regexSoloLetras.test(apellido_materno)) {
        mostrarError("Error: el apellido materno solo debe contener letras reales.");
        apellidoMInput.focus();
        return;
    }

    // 2. Validación de correo: sin puntos/caracteres al inicio ni justo antes/después del @, y con dominios reales
    const dominiosPermitidos = [
        "gmail.com", "hotmail.com", "hotmail.es",
        "outlook.com", "outlook.es", "live.com", "live.com.mx",
        "yahoo.com", "yahoo.com.mx", "yahoo.es",
        "icloud.com", "me.com", "msn.com",
        "proton.me", "protonmail.com",
        "acapulco.tecnm.mx", "tecnm.mx"
    ];

    const partesCorreo = correo.split("@");
    // Inicia y termina con letra o número antes del @, mínimo 3 caracteres, sin puntos consecutivos
    const regexUsuarioCorreo = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;

    if (
        partesCorreo.length !== 2 ||
        partesCorreo[0].length < 3 ||
        partesCorreo[0].includes("..") ||
        !regexUsuarioCorreo.test(partesCorreo[0]) ||
        !dominiosPermitidos.includes(partesCorreo[1])
    ) {
        mostrarError("Error: el correo no debe llevar puntos ni símbolos al inicio o antes/después del @, y debe usar un dominio válido (ej. @gmail.com, @hotmail.com, @outlook.com, @yahoo.com).");
        correoInput.focus();
        return;
    }

    // 3. Validación de teléfono de México (+52 o 52 seguido de 10 dígitos)
    const telefonoLimpio = telefono.replace(/[\s\-()]/g, '');
    const regexTelefonoMexico = /^(\+?52)\d{10}$/;
    if (!regexTelefonoMexico.test(telefonoLimpio)) {
        mostrarError("Error: el teléfono debe iniciar con la lada de México (+52 o 52) seguido de 10 dígitos (ej. +527441234567).");
        telefonoInput.focus();
        return;
    }

    if (passwordValor.length < 8) {
        mostrarError("Error: la contraseña debe tener mínimo 8 caracteres.");
        password.focus();
        return;
    }

    if (!/[0-9]/.test(passwordValor)) {
        mostrarError("Error: la contraseña debe contener al menos un número.");
        password.focus();
        return;
    }

    if (!/[^A-Za-z0-9]/.test(passwordValor)) {
        mostrarError("Error: la contraseña debe contener al menos un símbolo. Ejemplo: ! @ # $ %");
        password.focus();
        return;
    }

    if (passwordValor !== confirmarValor) {
        mostrarError("Error: las contraseñas no coinciden.");
        confirmarPassword.focus();
        return;
    }

    // Deshabilitar botón durante la petición
    if (botonRegistro) {
        botonRegistro.disabled = true;
        botonRegistro.textContent = "Registrando...";
    }

    // ====================================
    // PETICIÓN REAL AL BACKEND
    // ====================================

    try {
        const respuesta = await fetch('/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombres,
                apellido_paterno,
                apellido_materno,
                telefono: telefonoLimpio,
                correo,
                contrasena: passwordValor
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error || "No se pudo completar el registro.");
        }

        // ÉXITO TOTAL
        mostrarExito("¡Cuenta creada correctamente! Redirigiendo...");

        setTimeout(function () {
            window.location.href = "login.html";
        }, 2000);

    } catch (error) {
        mostrarError(error.message || "Error al registrar el usuario en el servidor.");
        
        if (botonRegistro) {
            botonRegistro.disabled = false;
            botonRegistro.textContent = "Crear cuenta";
        }
    }

});


// ========================================
// MOSTRAR ERROR
// ========================================

function mostrarError(texto) {
    mensaje.textContent = texto;
    mensaje.style.display = "block";
    mensaje.classList.remove("exito");
}


// ========================================
// MOSTRAR ÉXITO
// ========================================

function mostrarExito(texto) {
    mensaje.textContent = texto;
    mensaje.style.display = "block";
    mensaje.classList.add("exito");
}
