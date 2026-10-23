/* =========================================
   NUEVA CONTRASEÑA
   BACHE-OUT
   ========================================= */


const formularioNueva =
    document.getElementById("formularioNueva");


const nuevaContrasena =
    document.getElementById("nuevaContrasena");


const confirmarContrasena =
    document.getElementById("confirmarContrasena");


const mensajeError =
    document.getElementById("mensajeError");


/* =========================================
   ENVIAR FORMULARIO
   ========================================= */

formularioNueva.addEventListener("submit", function(event) {

    event.preventDefault();


    const nueva =
        nuevaContrasena.value.trim();


    const confirmacion =
        confirmarContrasena.value.trim();


    /* =========================================
       LIMPIAR ERRORES
       ========================================= */

    mensajeError.textContent = "";

    mensajeError.style.display = "none";

    nuevaContrasena.classList.remove("error");

    confirmarContrasena.classList.remove("error");


    /* =========================================
       CAMPOS VACÍOS
       ========================================= */

    if (nueva === "" || confirmacion === "") {

        mostrarError(
            "Todos los campos son obligatorios."
        );

        return;
    }


    /* =========================================
       MÍNIMO 8 CARACTERES
       ========================================= */

    if (nueva.length < 8) {

        mostrarError(
            "La contraseña debe tener mínimo 8 caracteres."
        );

        return;
    }


    /* =========================================
       AL MENOS UN NÚMERO
       ========================================= */

    if (!/[0-9]/.test(nueva)) {

        mostrarError(
            "La contraseña debe contener al menos un número."
        );

        return;
    }


    /* =========================================
       AL MENOS UN SÍMBOLO
       ========================================= */

    if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(nueva)) {

        mostrarError(
            "La contraseña debe contener al menos un símbolo."
        );

        return;
    }


    /* =========================================
       COMPROBAR QUE COINCIDAN
       ========================================= */

    if (nueva !== confirmacion) {

        mostrarError(
            "Las contraseñas no coinciden."
        );

        return;
    }


    /* =========================================
       CONTRASEÑA CORRECTA
       ========================================= */

    alert(
        "La contraseña se actualizó correctamente."
    );


    /* =========================================
       REGRESAR AL LOGIN
       ========================================= */

    window.location.href = "login.html";

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