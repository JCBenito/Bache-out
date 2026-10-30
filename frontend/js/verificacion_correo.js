
// =========================================
// ENVÍO DEL CÓDIGO DE VERIFICACIÓN
// =========================================

const formulario = document.querySelector("form");

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const correo = document.querySelector('input[type="email"]').value.trim();

    // Validar que se haya escrito un correo
    if (correo === "") {
        alert("Por favor, ingresa tu correo electrónico.");
        return;
    }

    // Mostrar ventana de confirmación
    alert(
        "Hemos enviado un código de verificación a tu correo electrónico. " +
        "Por favor, revisa tu bandeja de entrada o la sección de SPAM."
    );

    // Al presionar Aceptar, dirigir a la pantalla de verificación
    window.location.href = "verificacion_codigo.html";
});
