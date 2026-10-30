/* =========================================
   MIS REPORTES (DINÁMICO DESDE LA BASE DE DATOS)
   ========================================= */

document.addEventListener("DOMContentLoaded", async function () {

    // 1. Verificar sesión activa y obtener el ID del usuario de forma unificada
    let usuarioLogueado = null;
    try {
        usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
    } catch (e) {
        console.error("Error al leer la sesión", e);
    }

    if (!usuarioLogueado || !usuarioLogueado.id) {
        alert("Debes iniciar sesión para ver tus reportes.");
        window.location.href = "login.html";
        return;
    }

    const contenedorReportes = document.getElementById("contenedorReportes");
    const filtroEstado = document.getElementById("filtroEstado");
    const totalReportes = document.getElementById("totalReportes");
    const totalPendientes = document.getElementById("totalPendientes");
    const totalReparando = document.getElementById("totalReparando");
    const totalResueltos = document.getElementById("totalResueltos");

    let reportesGlobales = [];

    // 2. Función para obtener los reportes del servidor
    async function cargarReportes() {
        try {
            const respuesta = await fetch(`/api/reportes/usuario/${usuarioLogueado.id}`);
            const reportes = await respuesta.json();

            if (!respuesta.ok) {
                contenedorReportes.innerHTML = `<p style="text-align: center; color: #d9534f;">Error al cargar los reportes: ${reportes.error || 'Desconocido'}</p>`;
                return;
            }

            reportesGlobales = reportes;
            renderizarReportes(reportesGlobales);
            actualizarContadores(reportesGlobales);

        } catch (error) {
            console.error("Error de red:", error);
            contenedorReportes.innerHTML = `<p style="text-align: center; color: #d9534f;">No se pudo conectar con el servidor para obtener los reportes.</p>`;
        }
    }

    // 3. Renderizar las tarjetas dinámicamente en el HTML
    function renderizarReportes(lista) {
        contenedorReportes.innerHTML = "";

        if (lista.length === 0) {
            contenedorReportes.innerHTML = `<p style="text-align: center; padding: 20px; color: #7b898e;">No tienes ningún reporte registrado todavía.</p>`;
            return;
        }

        lista.forEach(reporte => {
            // Normalizar estado (por defecto 'pendiente' si viene vacío o nulo)
            const estadoRaw = (reporte.estado || 'pendiente').toLowerCase();
            let estadoClase = 'pendiente';
            let estadoTexto = 'Pendiente';

            if (estadoRaw.includes('repar')) {
                estadoClase = 'reparando';
                estadoTexto = 'En reparación';
            } else if (estadoRaw.includes('resuelt')) {
                estadoClase = 'resuelto';
                estadoTexto = 'Resuelto';
            } else if (estadoRaw.includes('cancel')) {
                estadoClase = 'cancelado';
                estadoTexto = 'Cancelado';
            }

            // Formatear fecha
            const fechaObj = new Date(reporte.fecha_reporte);
            const fechaTexto = isNaN(fechaObj.getTime()) 
                ? 'Fecha reciente' 
                : fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

            const articulo = document.createElement("article");
            articulo.classList.add("tarjeta-reporte");
            articulo.setAttribute("data-estado", estadoClase);

            articulo.innerHTML = `
                <div class="resumen-reporte">
                    <div class="informacion-reporte">
                        <span class="etiqueta-folio">ID del reporte</span>
                        <h2>${reporte.id_reporte}</h2>
                        <p class="ubicacion">${reporte.calle_referencia || 'Ubicación GPS'}</p>
                        <p class="fecha">${fechaTexto}</p>
                    </div>

                    <div class="acciones-reporte">
                        <span class="estado estado-${estadoClase}">${estadoTexto}</span>
                        <button class="btn-detalles" type="button">Ver detalles</button>
                    </div>
                </div>

                <div class="detalles-reporte">
                    <div class="seccion-detalle">
                        <h3>Fotografía del reporte</h3>
                        <img src="${reporte.fotografia_url || 'img/bache-ejemplo.jpg'}" alt="Fotografía del bache reportado" class="foto-reporte">
                    </div>

                    <div class="seccion-detalle">
                        <h3>Información del reporte</h3>
                        <div class="dato">
                            <span>Fecha del reporte</span>
                            <strong>${fechaTexto}</strong>
                        </div>
                        <div class="dato">
                            <span>Ubicación</span>
                            <strong>${reporte.calle_referencia || 'Ubicación por coordenadas GPS'}</strong>
                        </div>
                        <div class="dato">
                            <span>Descripción</span>
                            <strong>${reporte.descripcion}</strong>
                        </div>
                    </div>

                    ${obtenerHTMLSeguimiento(estadoClase)}
                </div>
            `;

            // Lógica para el botón "Ver detalles" (Desplegar / Ocultar)
            const btnDetalles = articulo.querySelector(".btn-detalles");
            btnDetalles.addEventListener("click", function () {
                articulo.classList.toggle("abierto");
                if (articulo.classList.contains("abierto")) {
                    btnDetalles.textContent = "Ocultar detalles";
                } else {
                    btnDetalles.textContent = "Ver detalles";
                }
            });

            contenedorReportes.appendChild(articulo);
        });
    }

    // 4. Actualizar los contadores superiores con datos reales
    function actualizarContadores(lista) {
        let pendientes = 0;
        let reparando = 0;
        let resueltos = 0;
        let cancelados = 0;

        lista.forEach(r => {
            const estado = (r.estado || 'pendiente').toLowerCase();
            if (estado.includes('pendiente')) pendientes++;
            else if (estado.includes('repar')) reparando++;
            else if (estado.includes('resuelt')) resueltos++;
            else if (estado.includes('cancel')) cancelados++;
        });

        if (totalReportes) totalReportes.textContent = lista.length;
        if (totalPendientes) totalPendientes.textContent = pendientes;
        if (totalReparando) totalReparando.textContent = reparando;
        if (totalResueltos) totalResueltos.textContent = resueltos;
    }

    // 5. Generar la barra de seguimiento o mensaje de cancelación dinámico
    function obtenerHTMLSeguimiento(estado) {
        if (estado === 'cancelado') {
            return `
                <div class="mensaje-cancelado">
                    <div class="circulo-cancelado">X</div>
                    <div>
                        <h3>Reporte cancelado</h3>
                        <p>Este reporte fue cancelado y no continuará con el proceso de reparación.</p>
                    </div>
                </div>
            `;
        }

        const esP2Completado = estado === 'reparando' || estado === 'resuelto';
        const esP3Completado = estado === 'resuelto';

        return `
            <div class="seguimiento">
                <h3>Seguimiento del reporte</h3>
                <div class="barra-seguimiento">
                    <div class="paso completado">
                        <div class="circulo">1</div>
                        <span>Pendiente</span>
                    </div>

                    <div class="linea ${esP2Completado ? 'completada' : ''}"></div>

                    <div class="paso ${estado === 'reparando' ? 'actual' : (esP2Completado ? 'completado' : '')}">
                        <div class="circulo">2</div>
                        <span>En reparación</span>
                    </div>

                    <div class="linea ${esP3Completado ? 'completada' : ''}"></div>

                    <div class="paso ${estado === 'resuelto' ? 'actual' : ''}">
                        <div class="circulo">3</div>
                        <span>Resuelto</span>
                    </div>
                </div>
            </div>
        `;
    }

    // 6. Filtrar reportes al cambiar la opción del selector
    if (filtroEstado) {
        filtroEstado.addEventListener("change", function () {
            const estadoSeleccionado = filtroEstado.value;
            const tarjetas = document.querySelectorAll(".tarjeta-reporte");

            tarjetas.forEach(tarjeta => {
                const estado = tarjeta.dataset.estado;

                if (estadoSeleccionado === "todos" || estado === estadoSeleccionado) {
                    tarjeta.classList.remove("oculto");
                } else {
                    tarjeta.classList.add("oculto");
                }
            });
        });
    }

    // Inicializar la carga de datos al abrir la página
    cargarReportes();
});
