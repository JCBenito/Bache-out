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
let idColoniaGlobal = 1; // Por defecto
let fotografiasSeleccionadas = [];

/* =========================================
   VALIDAR Y DETECTAR ZONA (ASIGNANDO ID CORRECTO)
   ========================================= */

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function detectarColoniaYValidar(lat, lon) {
    // 1. Barrios Históricos (ID 1)
    const centroBarriosHistoricos = { lat: 16.8530, lon: -99.9100 };
    
    // 2. Colonia Progreso (ID 2)
    const centroProgreso = { lat: 16.8670, lon: -99.8950 };
    
    // 3. La Libertad / Zona La Sabana (ID 3)
    const centroLaLibertad = { lat: 16.8715, lon: -99.8250 }; 

    const radioMaximoKm = 1.5; // Radio de 1.5 km por zona

    const distanciaBarrios = calcularDistanciaKm(lat, lon, centroBarriosHistoricos.lat, centroBarriosHistoricos.lon);
    const distanciaProgreso = calcularDistanciaKm(lat, lon, centroProgreso.lat, centroProgreso.lon);
    const distanciaLibertad = calcularDistanciaKm(lat, lon, centroLaLibertad.lat, centroLaLibertad.lon);

    // Identificar cuál está más cerca dentro del rango permitido
    if (distanciaLibertad <= radioMaximoKm && distanciaLibertad <= distanciaBarrios && distanciaLibertad <= distanciaProgreso) {
        idColoniaGlobal = 3; // La Libertad
        return true;
    }
    if (distanciaProgreso <= radioMaximoKm && distanciaProgreso <= distanciaBarrios) {
        idColoniaGlobal = 2; // Progreso
        return true;
    }
    if (distanciaBarrios <= radioMaximoKm) {
        idColoniaGlobal = 1; // Barrios Históricos
        return true;
    }

    return false; // Fuera de rango
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
    btnUbicacion.textContent = "Validando zona...";

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

            // Validar si está dentro del radio y asignar su ID de colonia correspondiente
            if (!detectarColoniaYValidar(lat, lon)) {
                errorUbicacion.textContent = "Estás fuera de la zona de cobertura. El servicio solo está disponible en Barrios Históricos, Progreso y La Libertad (Acapulco).";
                ubicacion.value = "";
                ubicacionObtenida = false;
                latitudGlobal = null;
                longitudGlobal = null;
                
                btnUbicacion.disabled = false;
                btnUbicacion.textContent = "Obtener ubicación";
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
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
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

    /* Recuperar datos del usuario autenticado */
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
        alert("No se encontró una sesión activa. Por favor, inicia sesión de nuevo.");
        window.location.href = "login.html";
        return;
    }

    const botonEnviar = formularioReporte.querySelector(".btn-enviar");

    try {
        botonEnviar.disabled = true;
        botonEnviar.textContent = "Obteniendo dirección y enviando...";

        /* Obtener la dirección real de la calle mediante geocodificación inversa */
        let direccionReal = "Lat: " + latitudGlobal.toFixed(5) + ", Lng: " + longitudGlobal.toFixed(5);
        try {
            const respuestaGeo = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitudGlobal}&lon=${longitudGlobal}&zoom=18&addressdetails=1`, {
                headers: { 'User-Agent': 'BacheOut-App' }
            });
            const datosGeo = await respuestaGeo.json();
            if (datosGeo && datosGeo.display_name) {
                direccionReal = datosGeo.display_name;
            }
        } catch (geoError) {
            console.error("No se pudo obtener la dirección exacta de la calle:", geoError);
        }

        /* Construir FormData para enviar archivos e información al servidor */
        const formData = new FormData();
        formData.append("id_usuario", usuarioLogueado.id);
        formData.append("id_estado", 1); // 1 = Pendiente por defecto en la BD
        formData.append("descripcion", textoDescripcion);
        formData.append("calle_referencia", direccionReal); 
        formData.append("latitud", latitudGlobal);
        formData.append("longitud", longitudGlobal);
        formData.append("id_colonia", idColoniaGlobal); 

        // Adjuntar todas las fotografías seleccionadas iterando el arreglo
        fotografiasSeleccionadas.forEach(archivo => {
            formData.append("fotografia", archivo);
        });

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
        botonEnviar.disabled = false;
        botonEnviar.textContent = "Enviar reporte";
    }
});
