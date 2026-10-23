
document.addEventListener("DOMContentLoaded", () => {
    const cuerpoReportes = document.getElementById("listaReportes");
    const buscarFolio = document.getElementById("buscarFolio");
    const filtroEstado = document.getElementById("filtroEstado");
    const filtroColonia = document.getElementById("filtroColonia");
    const filtroFecha = document.getElementById("filtroFecha");

    const modalDetalles = document.getElementById("modalDetalles");
    const modalEstado = document.getElementById("modalEstado");
    const contenidoDetalles = document.getElementById("contenidoDetalles");
    const nuevoEstado = document.getElementById("nuevoEstado");
    const descripcionAdmin = document.getElementById("descripcionAdmin");

    let idSeleccionado = null;

    const COLONIAS = {
        "la libertad": "La Libertad",
        "barrios historicos": "Barrios Históricos",
        "la progreso": "La Progreso"
    };

    function normalizar(texto) {
        return String(texto ?? "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function obtenerListaReportes() {
        return typeof reportes !== "undefined" && Array.isArray(reportes)
            ? reportes
            : [];
    }

    // Asigna IDs numéricos y los conserva entre visitas.
    function asegurarIds() {
        const lista = obtenerListaReportes();
        let siguienteId = lista.reduce((mayor, reporte) => {
            const id = Number(reporte.id);
            return Number.isInteger(id) && id > mayor ? id : mayor;
        }, 0) + 1;

        let huboCambios = false;

        lista.forEach((reporte) => {
            if (
                reporte.id === undefined ||
                reporte.id === null ||
                reporte.id === "" ||
                !Number.isInteger(Number(reporte.id))
            ) {
                reporte.id = siguienteId++;
                huboCambios = true;
            } else {
                reporte.id = Number(reporte.id);
            }
        });

        if (huboCambios) {
            guardarListaLocal(lista);
        }
    }

    function guardarListaLocal(lista) {
        try {
            localStorage.setItem("bo_reportes", JSON.stringify(lista));
            return true;
        } catch (error) {
            console.error("No se pudieron guardar los reportes:", error);
            return false;
        }
    }

    function obtenerId(reporte) {
        return Number(reporte.id);
    }

    function obtenerColonia(reporte) {
        const nombre = String(
            reporte.colonia ??
            reporte.ubicacion?.colonia ??
            ""
        );

        return COLONIAS[normalizar(nombre)] || null;
    }

    function obtenerEstado(reporte) {
        const estado = normalizar(
            reporte.estado ?? reporte.estatus ?? reporte.status ?? ""
        );

        if (estado.includes("pendiente")) return "pendiente";

        if (
            estado.includes("reparacion") ||
            estado.includes("proceso") ||
            estado.includes("atencion")
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

    function obtenerFecha(reporte) {
        const fecha = String(
            reporte.fecha ?? reporte.fechaRegistro ?? reporte.created_at ?? ""
        );

        if (!fecha) return "No disponible";

        const coincidencia = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (coincidencia) {
            return `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`;
        }

        const convertida = new Date(fecha);

        return Number.isNaN(convertida.getTime())
            ? fecha
            : convertida.toLocaleDateString("es-MX");
    }

    function obtenerFechaFiltro(reporte) {
        const valor = String(
            reporte.fecha ?? reporte.fechaRegistro ?? reporte.created_at ?? ""
        );

        const coincidencia = valor.match(/^(\d{4}-\d{2}-\d{2})/);

        if (coincidencia) return coincidencia[1];

        const fecha = new Date(valor);

        if (Number.isNaN(fecha.getTime())) return "";

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    }

    // Solo se toman en cuenta las tres colonias oficiales.
    function reportesPermitidos() {
        return obtenerListaReportes().filter(
            reporte => obtenerColonia(reporte) !== null
        );
    }

    function cargarColonias() {
        const valorActual = filtroColonia.value;
        filtroColonia.replaceChildren();

        const opciones = [
            ["", "Todas las colonias"],
            ["La Libertad", "La Libertad"],
            ["Barrios Históricos", "Barrios Históricos"],
            ["La Progreso", "La Progreso"]
        ];

        opciones.forEach(([valor, texto]) => {
            const opcion = document.createElement("option");
            opcion.value = valor;
            opcion.textContent = texto;
            filtroColonia.appendChild(opcion);
        });

        filtroColonia.value = opciones.some(opcion => opcion[0] === valorActual)
            ? valorActual
            : "";
    }

    function renderizarReportes() {
        const folioBuscado = normalizar(buscarFolio.value);
        const estadoBuscado = filtroEstado.value;
        const coloniaBuscada = filtroColonia.value;
        const fechaBuscada = filtroFecha.value;

        const filtrados = reportesPermitidos().filter(reporte => {
            const id = String(obtenerId(reporte));

            const coincideId = id.includes(folioBuscado);
            const coincideEstado =
                !estadoBuscado || obtenerEstado(reporte) === estadoBuscado;
            const coincideColonia =
                !coloniaBuscada || obtenerColonia(reporte) === coloniaBuscada;
            const coincideFecha =
                !fechaBuscada || obtenerFechaFiltro(reporte) === fechaBuscada;

            return coincideId &&
                coincideEstado &&
                coincideColonia &&
                coincideFecha;
        });

        filtrados.sort((a, b) => obtenerId(a) - obtenerId(b));
        cuerpoReportes.replaceChildren();

        filtrados.forEach(reporte => {
            const fila = document.createElement("tr");

            const idElemento = document.createElement("span");
            idElemento.className = "folio-reporte";
            idElemento.textContent = obtenerId(reporte);

            agregarCelda(fila, idElemento);
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
                mostrarDetalles(obtenerId(reporte));
            });

            const botonEstado = document.createElement("button");
            botonEstado.type = "button";
            botonEstado.className = "btn-cambiar";
            botonEstado.textContent = "Actualizar";
            botonEstado.addEventListener("click", () => {
                abrirCambiarEstado(obtenerId(reporte));
            });

            acciones.append(botonDetalles, botonEstado);
            agregarCelda(fila, acciones);
            cuerpoReportes.appendChild(fila);
        });

        document.getElementById("sinResultados").hidden = filtrados.length > 0;
    }

    function buscarReportePorId(id) {
        return obtenerListaReportes().find(
            reporte => obtenerId(reporte) === Number(id)
        );
    }

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

    function mostrarDetalles(id) {
        const reporte = buscarReportePorId(id);

        if (!reporte) {
            alert("No se encontró el reporte seleccionado.");
            return;
        }

        idSeleccionado = obtenerId(reporte);
        contenidoDetalles.replaceChildren();

        agregarDetalle("ID", obtenerId(reporte));
        agregarDetalle("Colonia", obtenerColonia(reporte));
        agregarDetalle("Dirección", reporte.dir);
        agregarDetalle("Ciudadano", reporte.user);
        agregarDetalle("Fecha", obtenerFecha(reporte));
        agregarDetalle("Estado actual", crearEtiquetaEstado(reporte));
        agregarDetalle("Descripción del ciudadano", reporte.desc);

        agregarDetalle(
            "Descripción del administrador",
            reporte.descripcionAdmin
        );

        if (reporte.lat !== undefined && reporte.lng !== undefined) {
            agregarDetalle("Latitud", reporte.lat);
            agregarDetalle("Longitud", reporte.lng);
        }

        if (reporte.foto) {
            const foto = document.createElement("img");
            foto.className = "detalle-foto";
            foto.src = reporte.foto;
            foto.alt = "Fotografía de evidencia del bache";
            agregarDetalle("Evidencia fotográfica", foto);
        } else {
            agregarDetalle("Evidencia fotográfica", "No hay fotografía disponible.");
        }

        modalDetalles.hidden = false;
    }

    function abrirCambiarEstado(id) {
        const reporte = buscarReportePorId(id);

        if (!reporte) {
            alert("No se encontró el reporte seleccionado.");
            return;
        }

        idSeleccionado = obtenerId(reporte);
        const estadoActual = nombreEstado(obtenerEstado(reporte));

        const opcion = [...nuevoEstado.options].find(
            item => normalizar(item.value) === normalizar(estadoActual)
        );

        nuevoEstado.value = opcion ? opcion.value : "Pendiente";
        descripcionAdmin.value = reporte.descripcionAdmin ?? "";

        modalEstado.hidden = false;
    }

    function guardarCambioEstado() {
        const reporte = buscarReportePorId(idSeleccionado);

        if (!reporte) {
            alert("No se encontró el reporte que deseas actualizar.");
            return;
        }

        const lista = obtenerListaReportes();
        const estadoAnterior = reporte.estado;
        const descripcionAnterior = reporte.descripcionAdmin;

        reporte.estado = nuevoEstado.value;

        // La descripción es opcional. Si se deja vacía, se conserva
        // la descripción anterior, si ya existía.
        const descripcionNueva = descripcionAdmin.value.trim();

        if (descripcionNueva) {
            reporte.descripcionAdmin = descripcionNueva;
        }

        if (!guardarListaLocal(lista)) {
            reporte.estado = estadoAnterior;
            reporte.descripcionAdmin = descripcionAnterior;
            alert("No fue posible guardar los cambios.");
            return;
        }

        modalEstado.hidden = true;
        document.dispatchEvent(new Event("reportes:cambio"));
        renderizarReportes();
    }

    document.getElementById("limpiarFiltros").addEventListener("click", () => {
        buscarFolio.value = "";
        filtroEstado.value = "";
        filtroColonia.value = "";
        filtroFecha.value = "";
        renderizarReportes();
    });

    buscarFolio.addEventListener("input", renderizarReportes);
    filtroEstado.addEventListener("change", renderizarReportes);
    filtroColonia.addEventListener("change", renderizarReportes);
    filtroFecha.addEventListener("change", renderizarReportes);

    document.getElementById("guardarEstado").addEventListener(
        "click",
        guardarCambioEstado
    );

    document.getElementById("irCambiarEstado").addEventListener("click", () => {
        if (idSeleccionado !== null) {
            modalDetalles.hidden = true;
            abrirCambiarEstado(idSeleccionado);
        }
    });

    document.querySelectorAll("[data-cerrar]").forEach(boton => {
        boton.addEventListener("click", () => {
            const modal = document.getElementById(boton.dataset.cerrar);
            if (modal) modal.hidden = true;
        });
    });

    [modalDetalles, modalEstado].forEach(modal => {
        modal.addEventListener("click", evento => {
            if (evento.target === modal) modal.hidden = true;
        });
    });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            modalDetalles.hidden = true;
            modalEstado.hidden = true;
        }
    });

    document.addEventListener("reportes:cambio", () => {
        cargarColonias();
        renderizarReportes();
    });

    asegurarIds();
    cargarColonias();
    renderizarReportes();
});
