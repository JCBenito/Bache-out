// ========================================
// ELEMENTOS DEL FORMULARIO
// ========================================

const formulario = document.getElementById("formularioRegistro");

const password = document.getElementById("password");
const confirmarPassword = document.getElementById("confirmarPassword");

const mostrarPassword = document.getElementById("mostrarPassword");
const mostrarConfirmar = document.getElementById("mostrarConfirmar");

const mensaje = document.getElementById("mensaje");


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
// VALIDAR FORMULARIO
// ========================================

formulario.addEventListener("submit", function (event) {

    // Evita que la página se recargue
    event.preventDefault();


    // ====================================
    // OBTENER DATOS
    // ====================================

    const telefono =
        document.getElementById("telefono").value.trim();

    const passwordValor =
        password.value;

    const confirmarValor =
        confirmarPassword.value;


    // Limpiar mensaje anterior

    mensaje.textContent = "";
    mensaje.style.display = "none";
    mensaje.classList.remove("exito");


    // ====================================
    // VALIDAR TELÉFONO
    // ====================================

    if (!/^[0-9]{10}$/.test(telefono)) {

        mostrarError(
            "Error: el número telefónico debe tener 10 dígitos."
        );

        return;
    }


    // ====================================
    // VALIDAR LONGITUD DE CONTRASEÑA
    // ====================================

    if (passwordValor.length < 8) {

        mostrarError(
            "Error: la contraseña debe tener mínimo 8 caracteres."
        );

        password.focus();

        return;
    }


    // ====================================
    // VALIDAR NÚMERO
    // ====================================

    if (!/[0-9]/.test(passwordValor)) {

        mostrarError(
            "Error: la contraseña debe contener al menos un número."
        );

        password.focus();

        return;
    }


    // ====================================
    // VALIDAR SÍMBOLO
    // ====================================

    if (!/[^A-Za-z0-9]/.test(passwordValor)) {

        mostrarError(
            "Error: la contraseña debe contener al menos un símbolo. Ejemplo: ! @ # $ %"
        );

        password.focus();

        return;
    }


    // ====================================
    // VALIDAR CONFIRMACIÓN
    // ====================================

    if (passwordValor !== confirmarValor) {

        mostrarError(
            "Error: las contraseñas no coinciden."
        );

        confirmarPassword.focus();

        return;
    }


    // ====================================
    // TODO CORRECTO
    // ====================================

    mostrarExito(
        "¡Cuenta creada correctamente!"
    );


    // ====================================
    // DESPUÉS DE CREAR LA CUENTA
    // ====================================

    setTimeout(function () {

        window.location.href = "login.html";

    }, 2000);

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