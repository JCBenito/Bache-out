
// =========================================
// VERIFICACIÓN DEL CÓDIGO
// =========================================

const formulario = document.querySelector("form");
const campoCodigo = document.querySelector('input[type="text"]');

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const codigo = campoCodigo.value.trim();

    // Validar que se hayan ingresado los seis dígitos
    if (!/^\d{6}$/.test(codigo)) {
        alert("Ingresa un código válido de 6 dígitos.");
        return;
    }

    // Mostrar confirmación
    const continuar = confirm(
        "¡Verificación exitosa!\n\n" +
        "Tu cuenta ha sido verificada correctamente. Presiona Aceptar para ingresar a Bache-Out."
    );

    // Redirigir al aceptar
    if (continuar) {
        window.location.href = "index.html";
    }
});
