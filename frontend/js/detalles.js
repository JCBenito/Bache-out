/* =========================================
   MIS REPORTES (DINÁMICO DESDE LA BASE DE DATOS)
   ========================================= */

document.addEventListener("DOMContentLoaded", async function () {

    let usuarioLogueado = null;
    try {
        const sesionCruda = localStorage.getItem("usuario");
        if (sesionCruda) {
            const parsed = JSON.parse(sesionCruda);
            usuarioLogueado = parsed.usuario || parsed;
        }
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

    function renderizarReportes(lista) {
        contenedorReportes.innerHTML = "";

        if (lista.length === 0) {
            contenedorReportes.innerHTML = `<p style="text-align: center; padding: 20px; color: #7b898e;">No tienes ningún reporte registrado todavía.</p>`;
            return;
        }

        lista.forEach(reporte => {
            const idEstado = parseInt(reporte.id_estado, 10) || 1;
            let estadoClase = 'pendiente';
            let estadoTexto = 'Pendiente';

            if (idEstado === 2 || reporte.id_estado === '2') {
                estadoClase = 'reparando';
                estadoTexto = 'En reparación';
            } else if (idEstado === 3 || reporte.id_estado === '3') {
                estadoClase = 'resuelto';
                estadoTexto = 'Resuelto';
            } else if (idEstado === 4 || reporte.id_estado === '4') {
                estadoClase = 'cancelado';
                estadoTexto = 'Cancelado';
            }

            const fechaObj = new Date(reporte.fecha_reporte);
            const fechaTexto = isNaN(fechaObj.getTime()) 
                ? 'Fecha reciente' 
                : fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

            // Validación limpia de la URL de la imagen
            let urlFoto = 'img/bache-ejemplo.jpg';
            if (reporte.fotografia_url) {
                urlFoto = reporte.fotografia_url.startsWith('/') 
                    ? reporte.fotografia_url 
                    : `/${reporte.fotografia_url}`;
            }

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
                        <img src="${urlFoto}" 
                             onerror="this.onerror=null; this.src='img/bache-ejemplo.jpg';" 
                             alt="Fotografía del bache reportado" 
                             class="foto-reporte">
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

                    ${obtenerHTMLSeguimiento(estadoClase, idEstado)}
                </div>
            `;

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

    function actualizarContadores(lista) {
        let pendientes = 0;
        let reparando = 0;
        let resueltos = 0;
        let cancelados = 0;

        lista.forEach(r => {
            const idEst = parseInt(r.id_estado, 10) || 1;
            if (idEst === 1) pendientes++;
            else if (idEst === 2) reparando++;
            else if (idEst === 3) resueltos++;
            else if (idEst === 4) cancelados++;
        });

        if (totalReportes) totalReportes.textContent = lista.length;
        if (totalPendientes) totalPendientes.textContent = pendientes;
        if (totalReparando) totalReparando.textContent = reparando;
        if (totalResueltos) totalResueltos.textContent = resueltos;
    }

    function obtenerHTMLSeguimiento(estadoClase, idEstadoReal) {
        if (estadoClase === 'cancelado') {
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

        const esP2Completado = idEstadoReal >= 2;
        const esP3Completado = idEstadoReal >= 3;
        const esP1Actual = idEstadoReal === 1;
        const esP2Actual = idEstadoReal === 2;
        const esP3Actual = idEstadoReal === 3;

        return `
            <div class="seguimiento">
                <h3>Seguimiento del reporte</h3>
                <div class="barra-seguimiento">
                    <div class="paso ${esP1Actual ? 'actual' : (esP2Completado ? 'completado' : '')}">
                        <div class="circulo">1</div>
                        <span>Pendiente</span>
                    </div>

                    <div class="linea ${esP2Completado ? 'completada' : ''}"></div>

                    <div class="paso ${esP2Actual ? 'actual' : (esP3Completado ? 'completado' : '')}">
                        <div class="circulo">2</div>
                        <span>En reparación</span>
                    </div>

                    <div class="linea ${esP3Completado ? 'completada' : ''}"></div>

                    <div class="paso ${esP3Actual ? 'actual' : ''}">
                        <div class="circulo">3</div>
                        <span>Resuelto</span>
                    </div>
                </div>
            </div>
        `;
    }

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

    cargarReportes();
});
