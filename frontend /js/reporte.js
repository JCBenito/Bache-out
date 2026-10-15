/* =========================================
   REPORTE DE BACHE
   ========================================= */


/* =========================================
   ELEMENTOS
   ========================================= */

const formularioReporte =
    document.getElementById("formularioReporte");

const btnUbicacion =
    document.getElementById("btnUbicacion");

const ubicacion =
    document.getElementById("ubicacion");

const errorUbicacion =
    document.getElementById("errorUbicacion");

const descripcion =
    document.getElementById("descripcion");

const contadorDescripcion =
    document.getElementById("contadorDescripcion");

const errorDescripcion =
    document.getElementById("errorDescripcion");

const fotografiaInput =
    document.getElementById("fotografia");

const nombresFotografias =
    document.getElementById("nombresFotografias");

const errorFotografia =
    document.getElementById("errorFotografia");



/* =========================================
   VARIABLES
   ========================================= */

let ubicacionObtenida = false;

let fotografiasSeleccionadas = [];



/* =========================================
   OBTENER UBICACIÓN
   ========================================= */

btnUbicacion.addEventListener(
    "click",
    function () {

        errorUbicacion.textContent = "";

        ubicacion.value = "";

        ubicacionObtenida = false;

        btnUbicacion.disabled = true;

        btnUbicacion.textContent =
            "Obteniendo ubicación...";


        if (!navigator.geolocation) {

            errorUbicacion.textContent =
                "La geolocalización no está disponible en este navegador.";

            btnUbicacion.disabled = false;

            btnUbicacion.textContent =
                "Obtener ubicación";

            return;
        }


        navigator.geolocation.getCurrentPosition(

            function (posicion) {

                const latitud =
                    posicion.coords.latitude;

                const longitud =
                    posicion.coords.longitude;


                ubicacion.value =
                    "Latitud: " +
                    latitud.toFixed(6) +
                    " | Longitud: " +
                    longitud.toFixed(6);


                ubicacionObtenida = true;


                btnUbicacion.disabled = false;

                btnUbicacion.textContent =
                    "Ubicación obtenida";


                errorUbicacion.textContent = "";

            },


            function () {

                ubicacionObtenida = false;

                ubicacion.value = "";


                errorUbicacion.textContent =
                    "No fue posible obtener tu ubicación. Activa el GPS y vuelve a intentarlo.";


                btnUbicacion.disabled = false;

                btnUbicacion.textContent =
                    "Obtener ubicación";

            }

        );

    }
);



/* =========================================
   CONTADOR DE DESCRIPCIÓN
   ========================================= */

descripcion.addEventListener(
    "input",
    function () {

        const cantidad =
            descripcion.value.length;


        contadorDescripcion.textContent =
            cantidad + " / 250";


        if (cantidad > 250) {

            contadorDescripcion.style.color =
                "#d9534f";

        } else {

            contadorDescripcion.style.color =
                "#7b898e";

        }

    }
);



/* =========================================
   SELECCIONAR FOTOGRAFÍAS
   ========================================= */

fotografiaInput.addEventListener(
    "change",
    function () {

        errorFotografia.textContent = "";


        const archivosNuevos =
            Array.from(
                fotografiaInput.files
            );


        const formatosPermitidos = [
            "image/jpeg",
            "image/png"
        ];


        /* =========================================
           VALIDAR FORMATOS
           ========================================= */

        for (
            const archivo of archivosNuevos
        ) {

            if (
                !formatosPermitidos.includes(
                    archivo.type
                )
            ) {

                errorFotografia.textContent =
                    "Solo se permiten fotografías JPG, JPEG o PNG.";

                fotografiaInput.value = "";

                return;
            }

        }


        /* =========================================
           EVITAR ARCHIVOS REPETIDOS
           ========================================= */

        const archivosParaAgregar =
            archivosNuevos.filter(
                function (archivo) {

                    return !fotografiasSeleccionadas.some(
                        function (foto) {

                            return (
                                foto.name === archivo.name &&
                                foto.size === archivo.size
                            );

                        }
                    );

                }
            );


        /* =========================================
           VALIDAR MÁXIMO DE 3
           ========================================= */

        if (
            fotografiasSeleccionadas.length +
            archivosParaAgregar.length > 3
        ) {

            errorFotografia.textContent =
                "Solo puedes agregar un máximo de 3 fotografías.";

            fotografiaInput.value = "";

            return;
        }


        /* =========================================
           AGREGAR FOTOGRAFÍAS
           ========================================= */

        fotografiasSeleccionadas.push(
            ...archivosParaAgregar
        );


        /* =========================================
           MOSTRAR NOMBRES
           ========================================= */

        mostrarNombresFotografias();


        /*
         * Limpiar el input permite volver a
         * seleccionar fotografías posteriormente.
         */

        fotografiaInput.value = "";

    }
);



/* =========================================
   MOSTRAR NOMBRES
   ========================================= */

function mostrarNombresFotografias() {

    nombresFotografias.innerHTML = "";


    fotografiasSeleccionadas.forEach(
        function (archivo, indice) {

            const contenedor =
                document.createElement("div");


            contenedor.classList.add(
                "archivo-fotografia"
            );


            const nombre =
                document.createElement("span");


            nombre.classList.add(
                "nombre-archivo"
            );


            nombre.textContent =
                archivo.name;


            const botonEliminar =
                document.createElement("button");


            botonEliminar.type =
                "button";


            botonEliminar.classList.add(
                "btn-eliminar-foto"
            );


            botonEliminar.textContent =
                "×";


            botonEliminar.title =
                "Eliminar fotografía";


            botonEliminar.addEventListener(
                "click",
                function () {

                    eliminarFotografia(
                        indice
                    );

                }
            );


            contenedor.appendChild(
                nombre
            );


            contenedor.appendChild(
                botonEliminar
            );


            nombresFotografias.appendChild(
                contenedor
            );

        }
    );

}



/* =========================================
   ELIMINAR FOTOGRAFÍA
   ========================================= */

function eliminarFotografia(indice) {

    fotografiasSeleccionadas.splice(
        indice,
        1
    );


    errorFotografia.textContent = "";


    mostrarNombresFotografias();

}



/* =========================================
   ENVIAR FORMULARIO
   ========================================= */

formularioReporte.addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();


        errorUbicacion.textContent = "";

        errorDescripcion.textContent = "";

        errorFotografia.textContent = "";


        /* =========================================
           VALIDAR UBICACIÓN
           ========================================= */

        if (!ubicacionObtenida) {

            errorUbicacion.textContent =
                "Debes obtener tu ubicación antes de enviar el reporte.";

            return;
        }


        /* =========================================
           VALIDAR DESCRIPCIÓN
           ========================================= */

        const textoDescripcion =
            descripcion.value.trim();


        if (
            textoDescripcion.length < 10
        ) {

            errorDescripcion.textContent =
                "La descripción debe tener mínimo 10 caracteres.";

            return;
        }


        if (
            textoDescripcion.length > 250
        ) {

            errorDescripcion.textContent =
                "La descripción no puede superar los 250 caracteres.";

            return;
        }


        /* =========================================
           VALIDAR FOTOGRAFÍAS
           ========================================= */

        if (
            fotografiasSeleccionadas.length === 0
        ) {

            errorFotografia.textContent =
                "Debes agregar al menos una fotografía del bache.";

            return;
        }


        if (
            fotografiasSeleccionadas.length > 3
        ) {

            errorFotografia.textContent =
                "Solo puedes agregar un máximo de 3 fotografías.";

            return;
        }


        /* =========================================
           REPORTE CORRECTO
           ========================================= */

        alert(
            "Reporte enviado correctamente."
        );


        window.location.href =
            "Detalles.html";

    }
);