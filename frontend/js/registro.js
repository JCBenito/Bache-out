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
    // OBTENER DATOS (Usando los IDs exactos del HTML)
    // ====================================
    const nombres = nombreInput ? nombreInput.value.trim() : "";
    const apellido_paterno = apellidoPInput ? apellidoPInput.value.trim() : "";
    const apellido_materno = apellidoMInput ? apellidoMInput.value.trim() : "";
    const correo = correoInput ? correoInput.value.trim() : "";
    const telefono = telefonoInput.value.trim();
    
    const passwordValor = password.value;
    const confirmarValor = confirmarPassword.value;

    // Limpiar mensaje anterior
    mensaje.textContent = "";
    mensaje.style.display = "none";
    mensaje.classList.remove("exito");

    // ====================================
    // VALIDACIONES LOCALES
    // ====================================

    if (!/^[0-9]{10}$/.test(telefono)) {
        mostrarError("Error: el número telefónico debe tener 10 dígitos.");
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
    // PETICIÓN REAL AL BACKEND (RENDER)
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
                telefono,
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
