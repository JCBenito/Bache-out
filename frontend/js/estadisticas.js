
document.addEventListener("DOMContentLoaded", () => {

    const filtroPeriodo = document.getElementById("periodoConsulta");
    const porcentajeResolucion = document.getElementById("porcentajeResolucion");
    const circuloProgreso = document.getElementById("circuloProgreso");
    const circuloValor = document.getElementById("circuloValor");

    const graficaEstados = document.getElementById("graficaEstados");
    const graficaColonias = document.getElementById("graficaColonias");
    const distribucionEstados = document.getElementById("distribucionEstados");

    const resumenEstados = document.getElementById("resumenEstados");
    const resumenColonias = document.getElementById("resumenColonias");

    const RADIO_CIRCULO = 66;
    const CIRCUNFERENCIA = 2 * Math.PI * RADIO_CIRCULO;

    // Las únicas colonias que se mostrarán en las estadísticas.
    const COLONIAS_PERMITIDAS = [
        "la libertad",
        "barrios historicos",
        "la progreso"
    ];

    // Nombres oficiales de las colonias.
    const COLONIAS_OFICIALES = {
        "la libertad": "La Libertad",
        "barrios historicos": "Barrios Históricos",
        "la progreso": "La Progreso"
    };

    // Obtiene los reportes compartidos por comun.js.
    function obtenerReportes() {
        if (typeof reportes !== "undefined" && Array.isArray(reportes)) {
            return reportes;
        }

        if (Array.isArray(window.reportes)) {
            return window.reportes;
        }

        return [];
    }

    // Normaliza los textos para comparar nombres y estados.
    function normalizarTexto(texto) {
        return String(texto ?? "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    // Obtiene el estado del reporte.
    function obtenerEstado(reporte) {
        return normalizarTexto(
            reporte.estado ??
            reporte.estatus ??
            reporte.status ??
            "Pendiente"
        );
    }

    function estaResuelto(reporte) {
        return [
            "resuelto",
            "resuelta",
            "terminado",
            "terminada",
            "finalizado",
            "finalizada"
        ].includes(obtenerEstado(reporte));
    }

    function estaPendiente(reporte) {
        return obtenerEstado(reporte) === "pendiente";
    }

    function estaEnReparacion(reporte) {
        return [
            "en reparacion",
            "reparacion",
            "en proceso",
            "en atencion"
        ].includes(obtenerEstado(reporte));
    }

    function estaCancelado(reporte) {
        return obtenerEstado(reporte) === "cancelado";
    }

    // Obtiene el nombre de una colonia y lo convierte a su nombre oficial.
    function obtenerColonia(reporte) {
        const colonia = String(
            reporte.colonia ??
            reporte.ubicacion?.colonia ??
            ""
        ).trim();

        const coloniaNormalizada = normalizarTexto(colonia);

        return COLONIAS_OFICIALES[coloniaNormalizada] || null;
    }

    // Excluye los reportes de colonias que no están autorizadas.
    function filtrarColoniasPermitidas(lista) {
        return lista.filter((reporte) => {
            const colonia = obtenerColonia(reporte);

            return colonia !== null &&
                COLONIAS_PERMITIDAS.includes(normalizarTexto(colonia));
        });
    }

    // Interpreta las fechas de los reportes.
    function obtenerFecha(reporte) {
        const valor =
            reporte.fecha ??
            reporte.fechaRegistro ??
            reporte.created_at;

        if (!valor) {
            return null;
        }

        // Interpreta correctamente las fechas con formato YYYY-MM-DD.
        if (
            typeof valor === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(valor)
        ) {
            const [anio, mes, dia] = valor.split("-").map(Number);
            return new Date(anio, mes - 1, dia);
        }

        const fecha = new Date(valor);

        return Number.isNaN(fecha.getTime())
            ? null
            : fecha;
    }

    // Filtra los reportes según el período seleccionado.
    function filtrarPorPeriodo(lista) {
        const dias = Number(filtroPeriodo.value);

        if (dias === 0) {
            return lista;
        }

        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999);

        const inicio = new Date();
        inicio.setDate(inicio.getDate() - dias + 1);
        inicio.setHours(0, 0, 0, 0);

        return lista.filter((reporte) => {
            const fecha = obtenerFecha(reporte);

            return fecha !== null &&
                fecha >= inicio &&
                fecha <= hoy;
        });
    }

    // Muestra un mensaje cuando no hay información.
    function mostrarMensaje(contenedor, mensaje) {
        contenedor.replaceChildren();

        const elemento = document.createElement("div");
        elemento.className = "mensaje-sin-datos";
        elemento.textContent = mensaje;

        contenedor.appendChild(elemento);
    }

    // Crea una barra para las gráficas.
    function crearBarra(nombre, cantidad, maximo, clase) {
        const fila = document.createElement("div");
        fila.className = "fila-grafica";

        const etiqueta = document.createElement("span");
        etiqueta.className = "nombre-grafica";
        etiqueta.textContent = nombre;

        const fondo = document.createElement("div");
        fondo.className = "fondo-barra";

        const relleno = document.createElement("div");
        relleno.className = `relleno-barra ${clase}`;

        const ancho = maximo > 0
            ? (cantidad / maximo) * 100
            : 0;

        relleno.style.width = `${ancho}%`;
        fondo.appendChild(relleno);

        const valor = document.createElement("span");
        valor.className = "valor-grafica";
        valor.textContent = cantidad;

        fila.append(etiqueta, fondo, valor);

        return fila;
    }

    // Actualiza el porcentaje de resolución.
    function actualizarPorcentaje(lista) {
        const total = lista.length;
        const resueltos = lista.filter(estaResuelto).length;

        const porcentaje = total > 0
            ? Math.round((resueltos / total) * 100)
            : 0;

        porcentajeResolucion.textContent = `${porcentaje}%`;

        const desplazamiento =
            CIRCUNFERENCIA -
            (porcentaje / 100) * CIRCUNFERENCIA;

        circuloValor.style.strokeDasharray = String(CIRCUNFERENCIA);
        circuloValor.style.strokeDashoffset = String(desplazamiento);

        circuloProgreso.setAttribute(
            "aria-label",
            `Porcentaje de resolución: ${porcentaje}%`
        );
    }

    // Gráfica de reportes según su estado.
    function dibujarEstados(lista) {
        graficaEstados.replaceChildren();

        if (lista.length === 0) {
            mostrarMensaje(
                graficaEstados,
                "No hay reportes de las tres colonias seleccionadas en este período."
            );

            resumenEstados.textContent = "";
            return;
        }

        const resueltos = lista.filter(estaResuelto).length;
        const pendientes = lista.filter(estaPendiente).length;
        const reparacion = lista.filter(estaEnReparacion).length;
        const cancelados = lista.filter(estaCancelado).length;

        const maximo = Math.max(
            resueltos,
            pendientes,
            reparacion,
            cancelados,
            1
        );

        graficaEstados.append(
            crearBarra("Resueltos", resueltos, maximo, "color-resuelto"),
            crearBarra("En reparación", reparacion, maximo, "color-reparacion"),
            crearBarra("Pendientes", pendientes, maximo, "color-pendiente"),
            crearBarra("Cancelados", cancelados, maximo, "color-cancelado")
        );

        resumenEstados.textContent =
            `Se muestran ${lista.length} reportes de La Libertad, Barrios Históricos y La Progreso.`;
    }

    // Cuenta los reportes de cada colonia permitida.
    function contarPorColonia(lista) {
        const conteo = {};

        // Inicializa las tres colonias para que siempre aparezcan.
        COLONIAS_PERMITIDAS.forEach((colonia) => {
            conteo[colonia] = 0;
        });

        lista.forEach((reporte) => {
            const colonia = obtenerColonia(reporte);

            if (colonia) {
                const clave = normalizarTexto(colonia);
                conteo[clave] = (conteo[clave] || 0) + 1;
            }
        });

        return COLONIAS_PERMITIDAS.map((colonia) => [
            COLONIAS_OFICIALES[colonia],
            conteo[colonia]
        ]);
    }

    // Gráfica de reportes por las tres colonias oficiales.
    function dibujarColonias(lista) {
        graficaColonias.replaceChildren();

        const colonias = contarPorColonia(lista);
        const maximo = Math.max(...colonias.map((item) => item[1]), 1);

        colonias.forEach(([nombre, cantidad]) => {
            graficaColonias.appendChild(
                crearBarra(nombre, cantidad, maximo, "color-colonia")
            );
        });

        const total = lista.length;

        resumenColonias.textContent = total > 0
            ? `Total de reportes en las tres colonias: ${total}.`
            : "No hay reportes de estas colonias en el período seleccionado.";
    }

    // Gráfica de colonias con más reportes pendientes.
    function dibujarPendientes(lista) {
        distribucionEstados.replaceChildren();

        const pendientes = lista.filter(estaPendiente);
        const colonias = contarPorColonia(pendientes);
        const maximo = Math.max(...colonias.map((item) => item[1]), 1);

        if (pendientes.length === 0) {
            mostrarMensaje(
                distribucionEstados,
                "No hay reportes pendientes en las tres colonias durante este período."
            );
            return;
        }

        // Solo se muestran La Libertad, Barrios Históricos y La Progreso.
        colonias.forEach(([nombre, cantidad]) => {
            const item = document.createElement("div");
            item.className = "item-pendiente";

            const encabezado = document.createElement("div");
            encabezado.className = "encabezado-pendiente";

            const etiqueta = document.createElement("span");
            etiqueta.className = "nombre-pendiente";
            etiqueta.textContent = nombre;

            const cantidadTexto = document.createElement("span");
            cantidadTexto.className = "cantidad-pendiente";
            cantidadTexto.textContent = `${cantidad} pendiente(s)`;

            encabezado.append(etiqueta, cantidadTexto);

            const fondo = document.createElement("div");
            fondo.className = "barra-pendiente";

            const relleno = document.createElement("div");
            relleno.className = "relleno-pendiente";
            relleno.style.width = `${(cantidad / maximo) * 100}%`;

            fondo.appendChild(relleno);
            item.append(encabezado, fondo);

            distribucionEstados.appendChild(item);
        });
    }

    // Actualiza todas las estadísticas.
    function actualizarEstadisticas() {
        const todos = obtenerReportes();
        const filtradosPorFecha = filtrarPorPeriodo(todos);
        const reportesValidos = filtrarColoniasPermitidas(filtradosPorFecha);

        actualizarPorcentaje(reportesValidos);
        dibujarEstados(reportesValidos);
        dibujarColonias(reportesValidos);
        dibujarPendientes(reportesValidos);
    }

    // Actualiza al cambiar el período o al modificarse los reportes.
    filtroPeriodo.addEventListener("change", actualizarEstadisticas);

    document.addEventListener(
        "reportes:cambio",
        actualizarEstadisticas
    );

    actualizarEstadisticas();

});
