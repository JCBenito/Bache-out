
/* =========================================
   BACHE-OUT | GESTIÓN DE REPORTES
========================================= */

const cuerpoReportes = document.getElementById("listaReportes");

const buscarFolio = document.getElementById("buscarFolio");
const filtroEstado = document.getElementById("filtroEstado");
const filtroColonia = document.getElementById("filtroColonia");
const filtroFecha = document.getElementById("filtroFecha");

const modalDetalles = document.getElementById("modalDetalles");
const modalEstado = document.getElementById("modalEstado");

const contenidoDetalles = document.getElementById("contenidoDetalles");
const nuevoEstado = document.getElementById("nuevoEstado");

let folioSeleccionado = null;


/* =========================================
   FUNCIONES AUXILIARES
========================================= */

function obtenerListaReportes() {
    return Array.isArray(reportes) ? reportes : [];
}

function normalizar(texto) {
    return String(texto ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function obtenerEstado(reporte) {
    const estado = normalizar(
        reporte.estado ?? reporte.estatus ?? reporte.status ?? ""
    );

    if (estado.includes("pendiente")) return "pendiente";

    if (
        estado.includes("reparacion") ||
        estado.includes("proceso")
    ) {
        return "reparacion";
    }

    if (
        estado.includes("resuelto") ||
        estado.includes("terminado") ||
        estado.includes("finalizado")
    ) {
        return "resuelto";
    }

    if (estado.includes("cancelado")) return "cancelado";

    return "desconocido";
}

function nombreEstado(estado) {
    const nombres = {
        pendiente: "Pendiente",
        reparacion: "En reparación",
        resuelto: "Resuelto",
        cancelado: "Cancelado",
        desconocido: "Sin estado"
    };

    return nombres[estado] || "Sin estado";
}

function crearEtiquetaEstado(reporte) {
    const estado = obtenerEstado(reporte);
    const etiqueta = document.createElement("span");

    etiqueta.className = `estado-etiqueta estado-${estado}`;
    etiqueta.textContent = nombreEstado(estado);

    return etiqueta;
}

function agregarCelda(fila, contenido) {
    const celda = document.createElement("td");

    if (contenido instanceof Node) {
        celda.appendChild(contenido);
    } else {
        celda.textContent = String(contenido ?? "No disponible");
    }

    fila.appendChild(celda);
    return celda;
}

function obtenerFolio(reporte) {
    return String(reporte.folio ?? reporte.id ?? "Sin folio");
}

function obtenerColonia(reporte) {
    return String(reporte.colonia ?? "No especificada");
}

function obtenerFecha(reporte) {
    const fecha = String(reporte.fecha ?? "");

    if (!fecha) return "No disponible";

    const coincidencia = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (coincidencia) {
        return `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`;
    }

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
        return fecha;
    }

    return fechaConvertida.toLocaleDateString("es-MX");
}

function obtenerFechaFiltro(reporte) {
    const fecha = String(reporte.fecha ?? "");
    const coincidencia = fecha.match(/^(\d{4}-\d{2}-\d{2})/);

    if (coincidencia) return coincidencia[1];

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) return "";

    const anio = fechaConvertida.getFullYear();
    const mes = String(fechaConvertida.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaConvertida.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


/* =========================================
   FILTRO DE COLONIAS
========================================= */

function cargarColonias() {
    const coloniaActual = filtroColonia.value;

    const colonias = [
        ...new Set(
            obtenerListaReportes()
                .map(obtenerColonia)
                .filter(colonia => colonia !== "No especificada")
        )
    ].sort((a, b) => a.localeCompare(b, "es"));

    filtroColonia.replaceChildren();

    const opcionTodas = document.createElement("option");
    opcionTodas.value = "";
    opcionTodas.textContent = "Todas las colonias";
    filtroColonia.appendChild(opcionTodas);

    colonias.forEach(colonia => {
        const opcion = document.createElement("option");
        opcion.value = colonia;
        opcion.textContent = colonia;
        filtroColonia.appendChild(opcion);
    });

    if (colonias.includes(coloniaActual)) {
        filtroColonia.value = coloniaActual;
    }
}


/* =========================================
   MOSTRAR Y FILTRAR REPORTES
========================================= */

function renderizarReportes() {
    const lista = obtenerListaReportes();

    const folioBuscado = normalizar(buscarFolio.value);
    const estadoBuscado = filtroEstado.value;
    const coloniaBuscada = filtroColonia.value;
    const fechaBuscada = filtroFecha.value;

    const filtrados = lista.filter(reporte => {
        const coincideFolio = normalizar(obtenerFolio(reporte))
            .includes(folioBuscado);

        const coincideEstado =
            !estadoBuscado || obtenerEstado(reporte) === estadoBuscado;

        const coincideColonia =
            !coloniaBuscada || obtenerColonia(reporte) === coloniaBuscada;

        const coincideFecha =
            !fechaBuscada || obtenerFechaFiltro(reporte) === fechaBuscada;

        return (
            coincideFolio &&
            coincideEstado &&
            coincideColonia &&
            coincideFecha
        );
    });

    filtrados.sort((a, b) =>
        String(b.fecha ?? "").localeCompare(String(a.fecha ?? ""))
    );

    cuerpoReportes.replaceChildren();

    filtrados.forEach(reporte => {
        const fila = document.createElement("tr");

        const folio = document.createElement("span");
        folio.className = "folio-reporte";
        folio.textContent = obtenerFolio(reporte);

        agregarCelda(fila, folio);
        agregarCelda(fila, obtenerColonia(reporte));
        agregarCelda(fila, reporte.user ?? "No disponible");
        agregarCelda(fila, obtenerFecha(reporte));
        agregarCelda(fila, crearEtiquetaEstado(reporte));

        const acciones = document.createElement("div");
        acciones.className = "acciones-reporte";

        const botonDetalles = document.createElement("button");
        botonDetalles.type = "button";
        botonDetalles.className = "btn-detalles";
        botonDetalles.textContent = "Ver detalles";

        botonDetalles.addEventListener("click", () => {
            mostrarDetalles(obtenerFolio(reporte));
        });

        const botonEstado = document.createElement("button");
        botonEstado.type = "button";
        botonEstado.className = "btn-cambiar";
        botonEstado.textContent = "Cambiar estado";

        botonEstado.addEventListener("click", () => {
            abrirCambiarEstado(obtenerFolio(reporte));
        });

        acciones.append(botonDetalles, botonEstado);
        agregarCelda(fila, acciones);

        cuerpoReportes.appendChild(fila);
    });

    document.getElementById("sinResultados").hidden =
        filtrados.length !== 0;
}


/* =========================================
   BUSCAR REPORTE POR FOLIO
========================================= */

function buscarReportePorFolio(folio) {
    return obtenerListaReportes().find(reporte =>
        obtenerFolio(reporte) === String(folio)
    );
}


/* =========================================
   VER DETALLES
========================================= */

function mostrarDetalles(folio) {
    const reporte = buscarReportePorFolio(folio);

    if (!reporte) {
        alert("No se encontró el reporte seleccionado.");
        return;
    }

    folioSeleccionado = obtenerFolio(reporte);
    contenidoDetalles.replaceChildren();

    function agregarDetalle(etiqueta, valor) {
        const fila = document.createElement("div");
        fila.className = "detalle-fila";

        const titulo = document.createElement("span");
        titulo.className = "detalle-etiqueta";
        titulo.textContent = etiqueta;

        const contenido = document.createElement("div");
        contenido.className = "detalle-valor";

        if (valor instanceof Node) {
            contenido.appendChild(valor);
        } else {
            contenido.textContent =
                valor === null || valor === undefined || valor === ""
                    ? "No disponible"
                    : String(valor);
        }

        fila.append(titulo, contenido);
        contenidoDetalles.appendChild(fila);
    }

    agregarDetalle("Folio", obtenerFolio(reporte));
    agregarDetalle("Colonia", obtenerColonia(reporte));
    agregarDetalle("Dirección", reporte.dir);
    agregarDetalle("Ciudadano", reporte.user);
    agregarDetalle("Fecha", obtenerFecha(reporte));

    agregarDetalle("Estado actual", crearEtiquetaEstado(reporte));
    agregarDetalle("Descripción", reporte.desc);

    if (reporte.lat !== undefined && reporte.lng !== undefined) {
        agregarDetalle("Latitud", reporte.lat);
        agregarDetalle("Longitud", reporte.lng);
    }

    if (reporte.foto) {
        const foto = document.createElement("img");
        foto.className = "detalle-foto";
        foto.src = reporte.foto;
        foto.alt = "Fotografía de evidencia del bache";
        foto.loading = "lazy";

        foto.addEventListener("error", () => {
            foto.alt = "No se pudo cargar la fotografía.";
        });

        agregarDetalle("Evidencia fotográfica", foto);
    } else {
        agregarDetalle(
            "Evidencia fotográfica",
            "No hay fotografía disponible."
        );
    }

    modalDetalles.hidden = false;
}


/* =========================================
   CAMBIAR ESTADO
========================================= */

function abrirCambiarEstado(folio) {
    const reporte = buscarReportePorFolio(folio);

    if (!reporte) {
        alert("No se encontró el reporte seleccionado.");
        return;
    }

    folioSeleccionado = obtenerFolio(reporte);

    const estadoActual = nombreEstado(obtenerEstado(reporte));

    const opcionActual = [...nuevoEstado.options].find(
        opcion => normalizar(opcion.value) === normalizar(estadoActual)
    );

    nuevoEstado.value = opcionActual
        ? opcionActual.value
        : "Pendiente";

    modalEstado.hidden = false;
}


/* =========================================
   GUARDAR CAMBIO DE ESTADO
========================================= */

function guardarCambioEstado() {
    const reporte = buscarReportePorFolio(folioSeleccionado);

    if (!reporte) {
        alert("No se encontró el reporte que deseas actualizar.");
        return;
    }

    const estadoNuevo = nuevoEstado.value;

    if (obtenerEstado(reporte) === normalizar(estadoNuevo)) {
        modalEstado.hidden = true;
        return;
    }

    const estadoAnterior = reporte.estado;

    reporte.estado = estadoNuevo;

    try {
        localStorage.setItem(
            "bo_reportes",
            JSON.stringify(obtenerListaReportes())
        );
    } catch (error) {
        reporte.estado = estadoAnterior;

        console.error("No se pudieron guardar los reportes:", error);
        alert("No fue posible guardar el cambio en el navegador.");
        return;
    }

    modalEstado.hidden = true;

    document.dispatchEvent(new Event("reportes:cambio"));

    cargarColonias();
    renderizarReportes();
}


/* =========================================
   LIMPIAR FILTROS
========================================= */

document.getElementById("limpiarFiltros").addEventListener("click", () => {
    buscarFolio.value = "";
    filtroEstado.value = "";
    filtroColonia.value = "";
    filtroFecha.value = "";

    renderizarReportes();
});


/* =========================================
   EVENTOS DE LOS FILTROS
========================================= */

buscarFolio.addEventListener("input", renderizarReportes);
filtroEstado.addEventListener("change", renderizarReportes);
filtroColonia.addEventListener("change", renderizarReportes);
filtroFecha.addEventListener("change", renderizarReportes);

document.getElementById("guardarEstado").addEventListener(
    "click",
    guardarCambioEstado
);

document.getElementById("irCambiarEstado").addEventListener("click", () => {
    if (folioSeleccionado) {
        modalDetalles.hidden = true;
        abrirCambiarEstado(folioSeleccionado);
    }
});


/* =========================================
   CERRAR MODALES
========================================= */

document.querySelectorAll("[data-cerrar]").forEach(boton => {
    boton.addEventListener("click", () => {
        const modal = document.getElementById(boton.dataset.cerrar);

        if (modal) {
            modal.hidden = true;
        }
    });
});

[modalDetalles, modalEstado].forEach(modal => {
    modal.addEventListener("click", evento => {
        if (evento.target === modal) {
            modal.hidden = true;
        }
    });
});

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
        modalDetalles.hidden = true;
        modalEstado.hidden = true;
    }
});


/* =========================================
   INICIAR PANTALLA
========================================= */

cargarColonias();
renderizarReportes();

document.addEventListener("reportes:cambio", () => {
    cargarColonias();
    renderizarReportes();
});
