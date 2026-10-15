// =========================================
// EDITAR DATOS DEL PERFIL
// =========================================

const btnEditar = document.getElementById("btnEditar");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");
const accionesEdicion = document.getElementById("accionesEdicion");

const correo = document.getElementById("correo");
const telefono = document.getElementById("telefono");

// Guardar los valores originales
let correoOriginal = correo.value;
let telefonoOriginal = telefono.value;

// =========================================
// ACTIVAR EDICIÓN
// =========================================

btnEditar.addEventListener("click", function () {

    // Solo se permite editar el correo y el teléfono
    correo.disabled = false;
    telefono.disabled = false;

    // Mantener bloqueados los nombres y apellidos
    document.getElementById("nombres").disabled = true;
    document.getElementById("apellidoPaterno").disabled = true;
    document.getElementById("apellidoMaterno").disabled = true;

    // Guardar los valores actuales por si se cancela
    correoOriginal = correo.value;
    telefonoOriginal = telefono.value;

    // Mostrar los botones de guardar y cancelar
    accionesEdicion.style.display = "flex";

    // Ocultar el botón de editar
    btnEditar.style.display = "none";
});

// =========================================
// CANCELAR EDICIÓN
// =========================================

btnCancelar.addEventListener("click", function () {

    // Restaurar los valores originales
    correo.value = correoOriginal;
    telefono.value = telefonoOriginal;

    // Bloquear nuevamente los campos
    correo.disabled = true;
    telefono.disabled = true;

    // Ocultar los botones de guardar y cancelar
    accionesEdicion.style.display = "none";

    // Mostrar nuevamente el botón de editar
    btnEditar.style.display = "inline-block";
});

// =========================================
// GUARDAR CAMBIOS
// =========================================

btnGuardar.addEventListener("click", function () {

    // Obtener los valores ingresados
    const correoNuevo = correo.value.trim();
    const telefonoNuevo = telefono.value.replace(/\s/g, "");

    // Validar que el correo no esté vacío
    if (correoNuevo === "") {
        alert("Ingresa tu correo electrónico.");
        correo.focus();
        return;
    }

    // Validar el formato del correo
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correoNuevo)) {
        alert("Ingresa un correo electrónico válido.");
        correo.focus();
        return;
    }

    // Validar que el teléfono tenga 10 dígitos
    if (!/^\d{10}$/.test(telefonoNuevo)) {
        alert("El número de teléfono debe contener 10 dígitos.");
        telefono.focus();
        return;
    }

    // Actualizar el teléfono sin espacios
    telefono.value = telefonoNuevo;

    // Bloquear nuevamente los campos
    correo.disabled = true;
    telefono.disabled = true;

    // Ocultar los botones de guardar y cancelar
    accionesEdicion.style.display = "none";

    // Mostrar nuevamente el botón de editar
    btnEditar.style.display = "inline-block";

    // Actualizar los valores originales
    correoOriginal = correo.value;
    telefonoOriginal = telefono.value;

    alert("Los datos se actualizaron correctamente.");
});