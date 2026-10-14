/* =========================================
   ELEMENTOS DEL FORMULARIO
========================================= */

const formulario = document.getElementById("formularioReporte");

const botonUbicacion = document.getElementById("btnUbicacion");

const campoUbicacion = document.getElementById("ubicacion");

const descripcionInput = document.getElementById("descripcion");

const contadorDescripcion =
    document.getElementById("contadorDescripcion");

const errorDescripcion =
    document.getElementById("errorDescripcion");


/* =========================================
   CONTADOR DE DESCRIPCIÓN
========================================= */

descripcionInput.addEventListener("input", function () {

    const cantidad = descripcionInput.value.length;

    contadorDescripcion.textContent =
        cantidad + " / 250 caracteres";


    /* Quitar error cuando la descripción
       vuelve a ser válida */

    if (cantidad >= 10 && cantidad <= 250) {

        errorDescripcion.textContent = "";

        descripcionInput.classList.remove("campo-error");

    }


    /* Mostrar error por pocos caracteres */

    else if (cantidad > 0 && cantidad < 10) {

        errorDescripcion.textContent =
            "La descripción debe tener mínimo 10 caracteres.";

        descripcionInput.classList.add("campo-error");

    }

});


/* =========================================
   OBTENER UBICACIÓN
========================================= */

botonUbicacion.addEventListener("click", function () {

    if (!navigator.geolocation) {

        alert(
            "Tu navegador no permite obtener la ubicación."
        );

        return;
    }


    botonUbicacion.textContent =
        "Obteniendo ubicación...";

    botonUbicacion.disabled = true;


    navigator.geolocation.getCurrentPosition(

        function (posicion) {

            const latitud =
                posicion.coords.latitude;

            const longitud =
                posicion.coords.longitude;


            campoUbicacion.value =
                "Latitud: " +
                latitud.toFixed(6) +
                " | Longitud: " +
                longitud.toFixed(6);


            botonUbicacion.textContent =
                "Ubicación obtenida";

            botonUbicacion.disabled = false;

        },


        function () {

            alert(
                "No fue posible obtener tu ubicación. " +
                "Verifica que hayas permitido el acceso a tu ubicación."
            );


            botonUbicacion.textContent =
                "Obtener mi ubicación";

            botonUbicacion.disabled = false;

        }

    );

});


/* =========================================
   ENVIAR REPORTE
========================================= */

formulario.addEventListener("submit", function (evento) {

    evento.preventDefault();


    /* =========================================
       OBTENER DATOS
    ========================================== */

    const descripcion =
        descripcionInput.value.trim();

    const gravedad =
        document.querySelector(
            'input[name="gravedad"]:checked'
        );

    const fotografia =
        document.getElementById("fotografia").files[0];


    /* =========================================
       VALIDAR UBICACIÓN
    ========================================== */

    if (campoUbicacion.value === "") {

        alert(
            "Primero debes obtener la ubicación del bache."
        );

        return;
    }


    /* =========================================
       VALIDAR DESCRIPCIÓN
    ========================================== */

    if (descripcion.length < 10) {

        errorDescripcion.textContent =
            "La descripción debe tener mínimo 10 caracteres.";

        descripcionInput.classList.add("campo-error");

        descripcionInput.focus();

        return;
    }


    if (descripcion.length > 250) {

        errorDescripcion.textContent =
            "La descripción no puede superar los 250 caracteres.";

        descripcionInput.classList.add("campo-error");

        descripcionInput.focus();

        return;
    }




    /* =========================================
       VALIDAR FOTOGRAFÍA
    ========================================== */

    if (!fotografia) {

        alert(
            "Debes agregar una fotografía del bache."
        );

        return;
    }


    /* =========================================
       REPORTE CORRECTO
    ========================================== */

    alert(
        "Reporte enviado correctamente."
    );


    /* Regresar al inicio */

    window.location.href =
        "index.html";

});