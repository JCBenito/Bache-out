/* =========================================
   REPORTE DE BACHE
   ========================================= */

/* =========================================
   ELEMENTOS
   ========================================= */

const formularioReporte = document.getElementById("formularioReporte");
const btnUbicacion = document.getElementById("btnUbicacion");
const ubicacion = document.getElementById("ubicacion");
const errorUbicacion = document.getElementById("errorUbicacion");
const descripcion = document.getElementById("descripcion");
const contadorDescripcion = document.getElementById("contadorDescripcion");
const errorDescripcion = document.getElementById("errorDescripcion");
const fotografiaInput = document.getElementById("fotografia");
const nombresFotografias = document.getElementById("nombresFotografias");
const errorFotografia = document.getElementById("errorFotografia");

/* =========================================
   VARIABLES
   ========================================= */

let ubicacionObtenida = false;
let latitudGlobal = null;
let longitudGlobal = null;
let fotografiasSeleccionadas = [];

/* =========================================
   VALIDAR ZONAS DESIGNADAS (ACAPULCO)
   Delimitación estricta para: Barrios Históricos, Progreso y La Libertad
   ========================================= */
function esZonaValida(lat, lon) {
    
    // 1. Zona: Barrios Históricos
    const enBarriosHistoricos = (
        lat >= 16.8450 && lat <= 16.8650 && 
        lon >= -99.9200 && lon <= -99.9000
    );

    // 2. Zona: Colonia Progreso
    const enProgreso = (
        lat >= 16.8550 && lat <= 16.8800 && 
        lon >= -99.9050 && lon <= -99.8850
    );

    // 3. Zona: Colonia La Libertad
    const enLaLibertad = (
        lat >= 16.8600 && lat <= 16.8850 && 
        lon >= -99.8900 && lon <= -99.8650
    );

    // Retorna true solo si está dentro de alguna de estas tres zonas exactas
    return enBarriosHistoricos || enProgreso || enLaLibertad;
}

/* =========================================
   OBTENER UBICACIÓN
   ========================================= */

btnUbicacion.addEventListener("click", function () {
    errorUbicacion.textContent = "";
    ubicacion.value = "";
    ubicacionObtenida = false;
    latitudGlobal = null;
    longitudGlobal = null;
    btnUbicacion.disabled = true;
    btnUbicacion.textContent = "Obteniendo ubicación...";

    if (!navigator.geolocation) {
        errorUbicacion.textContent = "La geolocalización no está disponible en este navegador.";
        btnUbicacion.disabled = false;
        btnUbicacion.textContent = "Obtener ubicación";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (posicion) {
            const lat = posicion.coords.latitude;
            const lon = posicion.coords.longitude;

            // Validar si está dentro de los polígonos permitidos
            if (!esZonaValida(lat, lon)) {
                errorUbicacion.textContent = "Estás fuera de la zona de cobertura. El servicio solo está disponible en Barrios Históricos, Progreso y La Libertad (Acapulco).";
                btnUbicacion.disabled = false;
                btnUbicacion.textContent = "Obtener ubicación";
                ubicacionObtenida = false;
                return;
            }

            latitudGlobal = lat;
            longitudGlobal = lon;

            ubicacion.value =
                "Latitud: " +
                latitudGlobal.toFixed(6) +
                " | Longitud: " +
                longitudGlobal.toFixed(6);

            ubicacionObtenida = true;
            btnUbicacion.disabled = false;
            btnUbicacion.textContent = "Ubicación obtenida";
            errorUbicacion.textContent = "";
        },
        function () {
            ubicacionObtenida = false;
            ubicacion.value = "";
            errorUbicacion.textContent = "No fue posible obtener tu ubicación. Activa el GPS y vuelve a intentarlo.";
            btnUbicacion.disabled = false;
            btnUbicacion.textContent = "Obtener ubicación";
        }
    );
});

/* =========================================
   CONTADOR DE DESCRIPCIÓN
   ========================================= */

descripcion.addEventListener("input", function () {
    const cantidad = descripcion.value.length;
    contadorDescripcion.textContent = cantidad + " / 250";

    if (cantidad > 250) {
        contadorDescripcion.style.color = "#d9534f";
    } else {
        contadorDescripcion.style.color = "#7b898e";
    }
});

/* =========================================
   SELECCIONAR FOTOGRAFÍAS
   ========================================= */

fotografiaInput.addEventListener("change", function () {
    errorFotografia.textContent = "";
    const archivosNuevos = Array.from(fotografiaInput.files);
    const formatosPermitidos = ["image/jpeg", "image/png"];

    for (const archivo of archivosNuevos) {
        if (!formatosPermitidos.includes(archivo.type)) {
            errorFotografia.textContent = "Solo se permiten fotografías JPG, JPEG o PNG.";
            fotografiaInput.value = "";
            return;
        }
    }

    const archivosParaAgregar = archivosNuevos.filter(function (archivo) {
        return !fotografiasSeleccionadas.some(function (foto) {
            return foto.name === archivo.name && foto.size === archivo.size;
        });
    });

    if (fotografiasSeleccionadas.length + archivosParaAgregar.length > 3) {
        errorFotografia.textContent = "Solo puedes agregar un máximo de 3 fotografías.";
        fotografiaInput.value = "";
        return;
    }

    fotografiasSeleccionadas.push(...archivosParaAgregar);
    mostrarNombresFotografias();
    fotografiaInput.value = "";
});

/* =========================================
   MOSTRAR NOMBRES
   ========================================= */

function mostrarNombresFotografias() {
    nombresFotografias.innerHTML = "";

    fotografiasSeleccionadas.forEach(function (archivo, indice) {
        const contenedor = document.createElement("div");
        contenedor.classList.add("archivo-fotografia");

        const nombre = document.createElement("span");
        nombre.classList.add("nombre-archivo");
        nombre.textContent = archivo.name;

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.classList.add("btn-eliminar-foto");
        botonEliminar.textContent = "×";
        botonEliminar.title = "Eliminar fotografía";

        botonEliminar.addEventListener("click", function () {
            eliminarFotografia(indice);
        });

        contenedor.appendChild(nombre);
        contenedor.appendChild(botonEliminar);
        nombresFotografias.appendChild(contenedor);
    });
}

/* =========================================
   ELIMINAR FOTOGRAFÍA
   ========================================= */

function eliminarFotografia(indice) {
    fotografiasSeleccionadas.splice(indice, 1);
    errorFotografia.textContent = "";
    mostrarNombresFotografias();
}

/* =========================================
   ENVIAR FORMULARIO (CONEXIÓN AL BACKEND)
   ========================================= */

formularioReporte.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    errorUbicacion.textContent = "";
    errorDescripcion.textContent = "";
    errorFotografia.textContent = "";

    /* Validar ubicación */
    if (!ubicacionObtenida || latitudGlobal === null || longitudGlobal === null) {
        errorUbicacion.textContent = "Debes obtener tu ubicación antes de enviar el reporte.";
        return;
    }

    /* Validar descripción */
    const textoDescripcion = descripcion.value.trim();
    if (textoDescripcion.length < 10) {
        errorDescripcion.textContent = "La descripción debe tener mínimo 10 caracteres.";
        return;
    }

    if (textoDescripcion.length > 250) {
        errorDescripcion.textContent = "La descripción no puede superar los 250 caracteres.";
        return;
    }

    /* Validar fotografías */
    if (fotografiasSeleccionadas.length === 0) {
        errorFotografia.textContent = "Debes agregar al menos una fotografía del bache.";
        return;
    }

    if (fotografiasSeleccionadas.length > 3) {
        errorFotografia.textContent = "Solo puedes agregar un máximo de 3 fotografías.";
        return;
    }

    /* Recuperar datos del usuario autenticado (guardados en localStorage durante el login) */
    let usuarioLogueado = null;
    try {
        usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
    } catch (e) {
        console.error("Error al leer la sesión", e);
    }

    if (!usuarioLogueado || !usuarioLogueado.id) {
        alert("No se encontró una sesión activa. Por favor, inicia sesión de nuevo.");
        window.location.href = "login.html";
        return;
    }

    /* Construir FormData para enviar archivos e información al servidor */
    const formData = new FormData();
    formData.append("id_usuario", usuarioLogueado.id);
    formData.append("descripcion", textoDescripcion);
    formData.append("calle_referencia", "Ubicación GPS por coordenadas");
    formData.append("latitud", latitudGlobal);
    formData.append("longitud", longitudGlobal);
    formData.append("id_colonia", 1); 

    if (fotografiasSeleccionadas.length > 0) {
        formData.append("fotografia", fotografiasSeleccionadas[0]);
    }

    try {
        const botonEnviar = formularioReporte.querySelector(".btn-enviar");
        botonEnviar.disabled = true;
        botonEnviar.textContent = "Enviando reporte...";

        const respuesta = await fetch("/api/reportes", {
            method: "POST",
            body: formData
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            alert("¡Reporte enviado correctamente con éxito!");
            window.location.href = "Detalles.html";
        } else {
            alert("Error del servidor: " + (resultado.error || "No se pudo registrar el reporte."));
            botonEnviar.disabled = false;
            botonEnviar.textContent = "Enviar reporte";
        }
    } catch (error) {
        console.error("Error de red:", error);
        alert("Ocurrió un error de conexión al intentar enviar el reporte.");
        const botonEnviar = formularioReporte.querySelector(".btn-enviar");
        botonEnviar.disabled = false;
        botonEnviar.textContent = "Enviar reporte";
    }
});
