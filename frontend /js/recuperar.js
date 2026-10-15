/* =========================================
   RECUPERAR CONTRASEÑA
   ========================================= */

const formularioRecuperar =
    document.getElementById("formularioRecuperar");

const datoUsuario =
    document.getElementById("datoUsuario");

const mensajeError =
    document.getElementById("mensajeError");


formularioRecuperar.addEventListener("submit", function(event) {

    event.preventDefault();

    const dato = datoUsuario.value.trim();


    /* LIMPIAR MENSAJE */

    mensajeError.textContent = "";

    mensajeError.style.display = "none";

    datoUsuario.classList.remove("error");


    /* VALIDAR CAMPO VACÍO */

    if (dato === "") {

        mostrarError(
            "Ingresa tu correo electrónico o número de teléfono."
        );

        return;
    }


    /* SIMULACIÓN DE RECUPERACIÓN */

    alert(
        "Se verificaron los datos de recuperación correctamente."
    );


    /* IR A NUEVA CONTRASEÑA */

    window.location.href = "contraseña.html";

});


/* =========================================
   MOSTRAR ERROR
   ========================================= */

function mostrarError(mensaje) {

    mensajeError.textContent = mensaje;

    mensajeError.style.display = "block";

    datoUsuario.classList.add("error");
}