
/* =========================================
   BACHE-OUT | RESUMEN DEL ADMINISTRADOR
========================================= */

// Crear el mapa pequeño del resumen
const mini = baseMap("miniMap", 12);
const capa = L.layerGroup().addTo(mini);


/* =========================================
   ACTUALIZAR TABLA, MAPA Y GRÁFICAS
========================================= */

function pintar() {
    const lista = Array.isArray(reportes) ? reportes : [];

    // Ordenar los reportes del más reciente al más antiguo
    const recientes = [...lista].sort((a, b) => {
        return String(b.fecha ?? "").localeCompare(
            String(a.fecha ?? "")
        );
    });

    // Mostrar los seis reportes más recientes
    $("#tRecent").innerHTML = rows(
        recientes.slice(0, 6),
        false
    );

    // Actualizar los marcadores del mapa
    ponerPines(capa, lista);

    // Actualizar las gráficas
    renderCharts();

    // Ajustar el mapa a las ubicaciones disponibles
    ajustarMapa(mini, lista);
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
