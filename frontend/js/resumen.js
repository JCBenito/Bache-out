/* =========================================
   BACHE-OUT | RESUMEN DEL ADMINISTRADOR
========================================= */

// Crear el mapa pequeño del resumen
const mini = baseMap("miniMap", 12);
const capa = L.layerGroup().addTo(mini);

const conCoordenadas = items =>
    items.filter(r =>
        Number.isFinite(Number(r.lat)) &&
        Number.isFinite(Number(r.lng))
    );


/* =========================================
   ACTUALIZAR TABLA, MAPA Y GRÁFICAS
========================================= */

function pintar() {
    const lista = Array.isArray(reportes) ? reportes : [];
    const listaMapa = conCoordenadas(lista);

    // Ordenar los reportes del más reciente al más antiguo
    const recientes = [...lista].sort((a, b) => {
        return String(b.fecha ?? "").localeCompare(
            String(a.fecha ?? "")
        );
    });

    // Mostrar los seis reportes más recientes (sin columna de acciones y con ID de reporte)
    $("#tRecent").innerHTML = rows(
        recientes.slice(0, 6),
        false
    );

    // Actualizar los marcadores del minimapa sin botón "Gestionar"
    ponerPines(capa, listaMapa, false);

    // Actualizar las gráficas
    renderCharts();

    // Ajustar el mapa a las ubicaciones disponibles
    ajustarMapa(mini, listaMapa);

    setTimeout(() => mini.invalidateSize(), 50);
}


/* =========================================
   INICIAR LA PANTALLA
========================================= */

pintar();

// Mantener la función de ubicación existente
seguirUbicacion([mini], () => {});


/* =========================================
   ESCUCHAR CAMBIOS EN LOS REPORTES
========================================= */

document.addEventListener("reportes:cambio", pintar);
