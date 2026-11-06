/* =========================================
   VARIABLES GLOBALES
========================================= */

let mapa;
let marcadores = [];
let marcadorUsuario = null;
let ventanaInformacion;
let reportes = []; // Se llenará dinámicamente con la base de datos


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

    // 1. Cargar los reportes reales desde la base de datos
    await cargarReportesDesdeBD();

    // 2. Configurar herramientas de interacción
    configurarFiltros();
    configurarMiUbicacion();
}


/* =========================================
   CARGAR REPORTES DESDE EL SERVIDOR (BD)
========================================= */

async function cargarReportesDesdeBD() {
    try {
        const respuesta = await fetch('/api/reportes');
        const datos = await respuesta.json();

        // Mapear los registros de PostgreSQL al formato que usa el mapa
        reportes = datos.map(r => {
            // Mapeo de ID de estado numérico a texto (ajustable según tu lógica)
            let estadoTexto = r.id_estado;
            if (r.id_estado === 1 || r.id_estado === "1") estadoTexto = "Pendiente";
            else if (r.id_estado === 2 || r.id_estado === "2") estadoTexto = "En reparación";
            else if (r.id_estado === 3 || r.id_estado === "3") estadoTexto = "Resuelto";
            else if (r.id_estado === 4 || r.id_estado === "4") estadoTexto = "Cancelado";

            return {
                ID: r.id_reporte,
                folio: `REPORTE #${r.id_reporte}`,
                estado: estadoTexto || "Pendiente",
                colonia: r.colonia || "Zona General",
                fecha: r.fecha_reporte ? new Date(r.fecha_reporte).toLocaleDateString() : "Reciente",
                descripcion: r.descripcion || "Sin descripción proporcionada.",
                lat: parseFloat(r.latitud),
                lng: parseFloat(r.longitud),
                fotografia_url: r.fotografia_url || null
            };
        });

        // Mostrar los reportes reales en el mapa
        mostrarReportes(reportes);
    } catch (error) {
        console.error("Error al obtener los reportes del servidor:", error);
    }
}


/* =========================================
   MOSTRAR REPORTES
========================================= */

function mostrarReportes(listaReportes) {
    eliminarMarcadores();

    listaReportes.forEach(function (reporte) {
        // Validar que tenga coordenadas válidas
        if (!reporte.lat || !reporte.lng) return;

        const marcador = new google.maps.Marker({
            position: {
                lat: reporte.lat,
                lng: reporte.lng
            },
            map: mapa,
            title: reporte.folio,
            icon: crearIcono(coloresEstado[reporte.estado] || "#f39c12")
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
   INFORMACIÓN DEL BACHE (POPUP)
========================================= */

function mostrarInformacion(marcador, reporte) {
    const color = coloresEstado[reporte.estado] || "#f39c12";

    let contenido = `
        <div class="info-bache" style="max-width: 220px;">
            <h3 style="margin: 0 0 5px 0;">${reporte.folio}</h3>

            <span class="info-estado" style="background-color: ${color}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                ${reporte.estado}
            </span>

            <p style="margin: 8px 0 4px 0;">
                <strong>Colonia:</strong> ${reporte.colonia}
            </p>

            <p style="margin: 4px 0;">
                <strong>Fecha:</strong> ${reporte.fecha}
            </p>

            <p style="margin: 4px 0;">
                <strong>Descripción:</strong> ${reporte.descripcion}
            </p>
    `;

    // Si el reporte tiene foto de evidencia, se agrega al popup
    if (reporte.fotografia_url) {
        contenido += `
            <div style="margin-top: 6px;">
                <img src="${reporte.fotografia_url}" style="width:100%; max-height: 120px; object-fit: cover; border-radius: 4px;" alt="Evidencia del bache">
            </div>
        `;
    }

    contenido += `
            <a href="Detalles.html?folio=${reporte.ID}" style="display: inline-block; margin-top: 8px; padding: 6px 10px; background-color: #159a9c; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold;">
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
    const filtroEstadoEl = document.getElementById("filtroEstado");
    const filtroColoniaEl = document.getElementById("filtroColonia");

    const estadoSeleccionado = filtroEstadoEl ? filtroEstadoEl.value : "todos";
    const coloniaSeleccionada = filtroColoniaEl ? filtroColoniaEl.value : "todas";

    const reportesFiltrados = reportes.filter(function (reporte) {
        const coincideEstado = estadoSeleccionado === "todos" || reporte.estado === estadoSeleccionado;
        const coincideColonia = coloniaSeleccionada === "todas" || reporte.colonia === coloniaSeleccionada;

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
                alert("No fue posible obtener tu ubicación. Verifica que hayas permitido el acceso.");
                boton.textContent = "Mi ubicación";
                boton.disabled = false;
            }
        );
    });
}


/* =========================================
   REGISTRO GLOBAL PARA GOOGLE MAPS
========================================= */

window.initMap = initMap;
