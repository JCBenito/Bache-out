/* =========================================
   MIS REPORTES
========================================= */


/* =========================================
   BOTONES "VER DETALLES"
========================================= */

const botonesDetalles =
    document.querySelectorAll(".btn-detalles");


botonesDetalles.forEach(function (boton) {

    boton.addEventListener("click", function () {

        const tarjeta =
            boton.closest(".tarjeta-reporte");


        /* =====================================
           ABRIR O CERRAR DETALLES
        ===================================== */

        tarjeta.classList.toggle("abierto");


        /* =====================================
           CAMBIAR TEXTO DEL BOTÓN
        ===================================== */

        if (tarjeta.classList.contains("abierto")) {

            boton.textContent =
                "Ocultar detalles";

        } else {

            boton.textContent =
                "Ver detalles";

        }

    });

});



/* =========================================
   ELEMENTOS
========================================= */

const tarjetasReportes =
    document.querySelectorAll(".tarjeta-reporte");


const filtroEstado =
    document.getElementById("filtroEstado");


const totalReportes =
    document.getElementById("totalReportes");


const totalPendientes =
    document.getElementById("totalPendientes");


const totalReparando =
    document.getElementById("totalReparando");


const totalResueltos =
    document.getElementById("totalResueltos");



/* =========================================
   CONTAR REPORTES
========================================= */

function contarReportes() {

    let pendientes = 0;

    let reparando = 0;

    let resueltos = 0;

    let cancelados = 0;


    tarjetasReportes.forEach(function (tarjeta) {

        const estado =
            tarjeta.dataset.estado;


        /* ==============================
           PENDIENTES
        ============================== */

        if (estado === "pendiente") {

            pendientes++;

        }


        /* ==============================
           EN REPARACIÓN
        ============================== */

        if (estado === "reparando") {

            reparando++;

        }


        /* ==============================
           RESUELTOS
        ============================== */

        if (estado === "resuelto") {

            resueltos++;

        }


        /* ==============================
           CANCELADOS
        ============================== */

        if (estado === "cancelado") {

            cancelados++;

        }

    });


    /* =====================================
       TOTAL DE REPORTES
    ===================================== */

    const total =
        pendientes +
        reparando +
        resueltos +
        cancelados;


    totalReportes.textContent =
        total;


    totalPendientes.textContent =
        pendientes;


    totalReparando.textContent =
        reparando;


    totalResueltos.textContent =
        resueltos;

}



/* =========================================
   FILTRAR REPORTES
========================================= */

filtroEstado.addEventListener(
    "change",
    function () {

        const estadoSeleccionado =
            filtroEstado.value;


        tarjetasReportes.forEach(
            function (tarjeta) {

                const estado =
                    tarjeta.dataset.estado;


                /* ==============================
                   MOSTRAR TODOS
                ============================== */

                if (
                    estadoSeleccionado === "todos"
                ) {

                    tarjeta.classList.remove(
                        "oculto"
                    );

                    return;
                }


                /* ==============================
                   MOSTRAR SOLO EL ESTADO
                ============================== */

                if (
                    estado === estadoSeleccionado
                ) {

                    tarjeta.classList.remove(
                        "oculto"
                    );

                } else {

                    tarjeta.classList.add(
                        "oculto"
                    );

                }

            }
        );

    }
);



/* =========================================
   INICIAR CONTADORES
========================================= */

contarReportes();