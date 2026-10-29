
/* =================================
   ELEMENTOS DEL FORMULARIO
================================= */

const formulario = document.getElementById("formularioVerificacion");
const correo = document.getElementById("correo");
const mensaje = document.getElementById("mensaje");


/* =================================
   MOSTRAR MENSAJES
================================= */

function mostrarMensaje(texto, tipo) {

    mensaje.textContent = texto;

    mensaje.className = "mensaje " + tipo;

}


/* =================================
   VALIDACIÓN VISUAL DEL CORREO
================================= */

formulario.addEventListener("submit", function (event) {

    event.preventDefault();

    const correoValor = correo.value.trim();

    mensaje.className = "mensaje";
    mensaje.textContent = "";

    if (correoValor === "") {

        mostrarMensaje(
            "Ingresa tu correo electrónico.",
            "error"
        );

        correo.focus();

        return;
    }

    if (!correo.checkValidity()) {

        mostrarMensaje(
            "Ingresa un correo electrónico válido.",
            "error"
        );

        correo.focus();

        return;
    }

    /*
       Por ahora solamente simulamos el envío.
       Posteriormente conectaremos esta pantalla
       con el backend y Gmail.
    */

    mostrarMensaje(
        "La pantalla está lista. El envío del código se habilitará en la siguiente etapa.",
        "exito"
    );

});
