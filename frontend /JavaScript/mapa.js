/* =========================================
   DATOS DE PRUEBA
========================================= */

const reportes = [

    {
        folio: "BCH-001",
        estado: "Pendiente",
        colonia: "La Libertad",
        fecha: "01/10/2026",
        descripcion: "Bache de tamaño mediano ubicado sobre la calle principal.",
        lat: 16.8605,
        lng: -99.8235
    },

    {
        folio: "BCH-002",
        estado: "En reparación",
        colonia: "La Progreso",
        fecha: "30/09/2026",
        descripcion: "Bache que afecta uno de los carriles de circulación.",
        lat: 16.8682,
        lng: -99.8310
    },

    {
        folio: "BCH-003",
        estado: "Resuelto",
        colonia: "Barrios Históricos",
        fecha: "27/09/2026",
        descripcion: "Bache reparado por la brigada correspondiente.",
        lat: 16.8508,
        lng: -99.9050
    },

    {
        folio: "BCH-004",
        estado: "Cancelado",
        colonia: "La Libertad",
        fecha: "25/09/2026",
        descripcion: "Reporte cancelado por información insuficiente.",
        lat: 16.8550,
        lng: -99.8180
    },

    {
        folio: "BCH-005",
        estado: "Pendiente",
        colonia: "La Progreso",
        fecha: "29/09/2026",
        descripcion: "Bache profundo ubicado cerca de una zona transitada.",
        lat: 16.8750,
        lng: -99.8250
    },

    {
        folio: "BCH-006",
        estado: "En reparación",
        colonia: "Barrios Históricos",
        fecha: "28/09/2026",
        descripcion: "Bache en proceso de reparación.",
        lat: 16.8460,
        lng: -99.9140
    }

];


/* =========================================
   VARIABLES
========================================= */

let mapa;

let marcadores = [];

let marcadorUsuario = null;

let ventanaInformacion;


/* =========================================
   COLORES DE LOS ESTADOS
========================================= */

const coloresEstado = {

    "Pendiente": "#f39c12",

    "En reparación": "#3498db",

    "Resuelto": "#27ae60",

    "Cancelado": "#e74c3c"

};


/* =========================================
   INICIALIZAR GOOGLE MAPS
========================================= */

function initMap() {

    const acapulco = {
        lat: 16.8531,
        lng: -99.8237
    };


    mapa = new google.maps.Map(
        document.getElementById("mapa"),
        {
            center: acapulco,
            zoom: 13,

            mapTypeControl: true,

            streetViewControl: true,

            fullscreenControl: true,

            zoomControl: true
        }
    );


    ventanaInformacion =
        new google.maps.InfoWindow();


    mostrarReportes(reportes);


    configurarFiltros();


    configurarMiUbicacion();

}


/* =========================================
   MOSTRAR REPORTES
========================================= */

function mostrarReportes(listaReportes) {

    eliminarMarcadores();


    listaReportes.forEach(function (reporte) {

        const marcador =
            new google.maps.Marker({

                position: {
                    lat: reporte.lat,
                    lng: reporte.lng
                },

                map: mapa,

                title: reporte.folio,

                icon: crearIcono(
                    coloresEstado[reporte.estado]
                )

            });


        marcador.reporte = reporte;


        marcador.addListener(
            "click",
            function () {

                mostrarInformacion(
                    marcador,
                    reporte
                );

            }
        );


        marcadores.push(marcador);

    });

}


/* =========================================
   CREAR ICONO DEL PIN
========================================= */

function crearIcono(color) {

    return {

        path: google.maps.SymbolPath.CIRCLE,

        scale: 9,

        fillColor: color,

        fillOpacity: 1,

        strokeColor: "#ffffff",

        strokeWeight: 3

    };

}


/* =========================================
   INFORMACIÓN DEL BACHE
========================================= */

function mostrarInformacion(
    marcador,
    reporte
) {

    const color =
        coloresEstado[reporte.estado];


    const contenido = `

        <div class="info-bache">

            <h3>
                ${reporte.folio}
            </h3>


            <span
                class="info-estado"
                style="
                    background-color: ${color};
                    color: white;
                "
            >
                ${reporte.estado}
            </span>


            <p>
                <strong>Colonia:</strong>
                ${reporte.colonia}
            </p>


            <p>
                <strong>Fecha:</strong>
                ${reporte.fecha}
            </p>


            <p>
                <strong>Descripción:</strong>
                ${reporte.descripcion}
            </p>


            <a
                href="Detalles.html?folio=${reporte.folio}"
                style="
                    display: inline-block;
                    margin-top: 8px;
                    padding: 7px 12px;
                    background-color: #159a9c;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: bold;
                "
            >
                Ver detalles
            </a>

        </div>

    `;


    ventanaInformacion.setContent(
        contenido
    );


    ventanaInformacion.open(
        mapa,
        marcador
    );

}


/* =========================================
   ELIMINAR MARCADORES
========================================= */

function eliminarMarcadores() {

    marcadores.forEach(
        function (marcador) {

            marcador.setMap(null);

        }
    );


    marcadores = [];

}


/* =========================================
   FILTROS
========================================= */

function configurarFiltros() {

    const filtroEstado =
        document.getElementById(
            "filtroEstado"
        );


    const filtroColonia =
        document.getElementById(
            "filtroColonia"
        );


    filtroEstado.addEventListener(
        "change",
        aplicarFiltros
    );


    filtroColonia.addEventListener(
        "change",
        aplicarFiltros
    );

}


/* =========================================
   APLICAR FILTROS
========================================= */

function aplicarFiltros() {

    const estadoSeleccionado =
        document.getElementById(
            "filtroEstado"
        ).value;


    const coloniaSeleccionada =
        document.getElementById(
            "filtroColonia"
        ).value;


    const reportesFiltrados =
        reportes.filter(
            function (reporte) {

                const coincideEstado =
                    estadoSeleccionado === "todos" ||
                    reporte.estado === estadoSeleccionado;


                const coincideColonia =
                    coloniaSeleccionada === "todas" ||
                    reporte.colonia === coloniaSeleccionada;


                return (
                    coincideEstado &&
                    coincideColonia
                );

            }
        );


    mostrarReportes(
        reportesFiltrados
    );

}


/* =========================================
   MI UBICACIÓN
========================================= */

function configurarMiUbicacion() {

    const boton =
        document.getElementById(
            "btnMiUbicacion"
        );


    boton.addEventListener(
        "click",
        function () {

            if (!navigator.geolocation) {

                alert(
                    "Tu navegador no permite obtener la ubicación."
                );

                return;
            }


            boton.textContent =
                "Obteniendo ubicación...";

            boton.disabled = true;


            navigator.geolocation.getCurrentPosition(

                function (posicion) {

                    const latitud =
                        posicion.coords.latitude;


                    const longitud =
                        posicion.coords.longitude;


                    const ubicacion = {

                        lat: latitud,

                        lng: longitud

                    };


                    if (marcadorUsuario) {

                        marcadorUsuario.setMap(
                            null
                        );

                    }


                    marcadorUsuario =
                        new google.maps.Marker({

                            position: ubicacion,

                            map: mapa,

                            title: "Mi ubicación",

                            icon: {

                                path:
                                    google.maps.SymbolPath.CIRCLE,

                                scale: 8,

                                fillColor: "#173F4A",

                                fillOpacity: 1,

                                strokeColor: "#ffffff",

                                strokeWeight: 3

                            }

                        });


                    mapa.setCenter(
                        ubicacion
                    );


                    mapa.setZoom(16);


                    boton.textContent =
                        "Mi ubicación";

                    boton.disabled = false;

                },


                function () {

                    alert(
                        "No fue posible obtener tu ubicación. " +
                        "Verifica que hayas permitido el acceso a tu ubicación."
                    );


                    boton.textContent =
                        "Mi ubicación";

                    boton.disabled = false;

                }

            );

        }
    );

}


/* =========================================
   GOOGLE MAPS
========================================= */

window.initMap = initMap;