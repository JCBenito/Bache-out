const formulario = document.getElementById("recuperarForm");

const usuario = document.getElementById("usuario");

const errorUsuario = document.getElementById("errorUsuario");

const modal = document.getElementById("modalRecuperacion");

const cerrarModal = document.getElementById("cerrarModal");


formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const valor = usuario.value.trim();

    errorUsuario.textContent = "";

    usuario.classList.remove("error-input");


    // CAMPO VACÍO

    if (valor === "") {

        errorUsuario.textContent =
            "Ingresa tu correo electrónico o número telefónico.";

        usuario.classList.add("error-input");

        return;
    }


    // VALIDAR CORREO

    const esCorreo =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);


    // VALIDAR TELÉFONO

    const esTelefono =
        /^[0-9]{10}$/.test(valor);


    // DATO INCORRECTO

    if (!esCorreo && !esTelefono) {

        errorUsuario.textContent =
            "Ingresa un correo válido o un número telefónico de 10 dígitos.";

        usuario.classList.add("error-input");

        return;
    }


    // MOSTRAR VENTANA EMERGENTE

    modal.classList.add("activo");

});


cerrarModal.addEventListener("click", function() {

    modal.classList.remove("activo");

    window.location.href = "login.html";

});