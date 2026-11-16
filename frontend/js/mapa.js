/* =========================================
   VARIABLES GLOBALES
========================================= */

let mapa;
let marcadores = [];
let marcadorUsuario = null;
let ventanaInformacion;
let reportesGlobal = []; // Almacenará los reportes reales de la BD para los filtros

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
   INICIALIZAR GOOGLE MAPS Y CARGAR REPORTES
========================================= */

async function initMap() {
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

    ventanaInformacion = new google.maps.InfoWindow();

    // 1. Cargar los reportes reales desde el servidor
    await cargarReportesReales();

    // 2. Configurar herramientas de interacción
    configurarFiltros();
    configurarMiUbicacion();
}


/* =========================================
   OBTENER REPORTES DESDE LA BASE DE DATOS
========================================= */

async function cargarReportesReales() {
    try {
        // Se añade un parámetro único de tiempo (?_t=...) para evitar que el navegador guarde en caché datos viejos
        const respuesta = await fetch('/api/reportes?_t=' + new Date().getTime());
        
        if (!respuesta.ok) {
            throw new Error("Error al obtener los reportes del servidor.");
        }

        const datos = await respuesta.json();

        // Mapear los campos de la base de datos al formato que usa tu mapa
        reportesGlobal = datos.map(r => {
            // Mapear el ID de estado numérico o de texto si viene de la BD
            let estadoTexto = "Pendiente";
            if (r.id_estado === 2 || r.id_estado === "En reparación") estadoTexto = "En reparación";
            if (r.id_estado === 3 || r.id_estado === "Resuelto") estadoTexto = "Resuelto";
            if (r.id_estado === 4 || r.id_estado === "Cancelado") estadoTexto = "Cancelado";
            if (typeof r.id_estado === "string" && coloresEstado[r.id_estado]) {
                estadoTexto = r.id_estado;
            }

            // Formatear fecha legible si viene en formato ISO
            let fechaFormateada = "Reciente";
            if (r.fecha_reporte) {
                const fechaObj = new Date(r.fecha_reporte);
                if (!isNaN(fechaObj)) {
                    fechaFormateada = fechaObj.toLocaleDateString();
                }
            }

            return {
                ID: r.id_reporte,
                folio: `REPORTE #${r.id_reporte}`,
                estado: estadoTexto,
                colonia: r.colonia || "Zona general",
                fecha: fechaFormateada,
                descripcion: r.descripcion || "Sin descripción proporcionada.",
                lat: parseFloat(r.latitud),
                lng: parseFloat(r.longitud)
            };
        });

        // Mostrar los reportes reales en el mapa
        mostrarReportes(reportesGlobal);

    } catch (error) {
        console.error("No se pudieron cargar los reportes en el mapa:", error);
    }
}


/* =========================================
   MOSTRAR REPORTES EN EL MAPA
========================================= */

function mostrarReportes(listaReportes) {
    eliminarMarcadores();

    listaReportes.forEach(function (reporte) {
        // Validar que tenga coordenadas válidas antes de poner el pin
        if (!reporte.lat || !reporte.lng) return;

        const marcador = new google.maps.Marker({
            position: {
                lat: reporte.lat,
                lng: reporte.lng
            },
            map: mapa,
            title: reporte.folio,
            icon: crearIcono(
                coloresEstado[reporte.estado] || "#95a5a6"
            )
        });

        marcador.reporte = reporte;

        marcador.addListener(
            "click",
            function () {
                mostrarInformacion(marcador, reporte);
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

function mostrarInformacion(marcador, reporte) {
    const color = coloresEstado[reporte.estado] || "#95a5a6";

    const contenido = `
        <div class="info-bache">
            <h3>${reporte.folio}</h3>

            <span
                class="info-estado"
                style="
                    background-color: ${color};
                    color: white;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                "
            >
                ${reporte.estado}
            </span>

            <p style="margin-top: 8px;">
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
                href="Detalles.html?id=${reporte.ID}"
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

    ventanaInformacion.setContent(contenido);
    ventanaInformacion.open(mapa, marcador);
}


/* =========================================
   ELIMINAR MARCADORES
========================================= */

function eliminarMarcadores() {
    marcadores.forEach(function (marcador) {
        marcador.setMap(null);
    });
    marcadores = [];
}


/* =========================================
   FILTROS
========================================= */

function configurarFiltros() {
    const filtroEstado = document.getElementById("filtroEstado");
    const filtroColonia = document.getElementById("filtroColonia");

    if (filtroEstado) {
        filtroEstado.addEventListener("change", aplicarFiltros);
    }
    if (filtroColonia) {
        filtroColonia.addEventListener("change", aplicarFiltros);
    }
}


/* =========================================
   APLICAR FILTROS
========================================= */

function aplicarFiltros() {
    const estadoSeleccionado = document.getElementById("filtroEstado")?.value || "todos";
    const coloniaSeleccionada = document.getElementById("filtroColonia")?.value || "todas";

    const reportesFiltrados = reportesGlobal.filter(function (reporte) {
        const coincideEstado =
            estadoSeleccionado === "todos" ||
            reporte.estado.toLowerCase() === estadoSeleccionado.toLowerCase();

        const coincideColonia =
            coloniaSeleccionada === "todas" ||
            reporte.colonia.toLowerCase() === coloniaSeleccionada.toLowerCase();

        return coincideEstado && coincideColonia;
    });

    mostrarReportes(reportesFiltrados);
}


/* =========================================
   MI UBICACIÓN
========================================= */

function configurarMiUbicacion() {
    const boton = document.getElementById("btnMiUbicacion");

    if (!boton) return;

    boton.addEventListener("click", function () {
        if (!navigator.geolocation) {
            alert("Tu navegador no permite obtener la ubicación.");
            return;
        }

        boton.textContent = "Obteniendo ubicación...";
        boton.disabled = true;

        navigator.geolocation.getCurrentPosition(
            function (posicion) {
                const ubicacion = {
                    lat: posicion.coords.latitude,
                    lng: posicion.coords.longitude
                };

                if (marcadorUsuario) {
                    marcadorUsuario.setMap(null);
                }

                marcadorUsuario = new google.maps.Marker({
                    position: ubicacion,
                    map: mapa,
                    title: "Mi ubicación",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#173F4A",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 3
                    }
                });

                mapa.setCenter(ubicacion);
                mapa.setZoom(16);

                boton.textContent = "Mi ubicación";
                boton.disabled = false;
            },
            function () {
                alert("No fue posible obtener tu ubicación. Verifica los permisos del navegador.");
                boton.textContent = "Mi ubicación";
                boton.disabled = false;
            }
        );
    });
}


/* =========================================
   GOOGLE MAPS CALLBACK
========================================= */

window.initMap = initMap;
