
/* =========================================
   EDITAR DATOS DEL PERFIL
========================================= */

const btnEditar = document.getElementById("btnEditar");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");
const accionesEdicion = document.getElementById("accionesEdicion");

const correo = document.getElementById("correo");
const telefono = document.getElementById("telefono");
const nombres = document.getElementById("nombres");
const apellidoPaterno = document.getElementById("apellidoPaterno");
const apellidoMaterno = document.getElementById("apellidoMaterno");

let correoOriginal = correo.value;
let telefonoOriginal = telefono.value;


// Activar edición
btnEditar.addEventListener("click", function () {
    correo.disabled = false;
    telefono.disabled = false;

    nombres.disabled = true;
    apellidoPaterno.disabled = true;
    apellidoMaterno.disabled = true;

    correoOriginal = correo.value;
    telefonoOriginal = telefono.value;

    accionesEdicion.style.display = "flex";
    btnEditar.style.display = "none";
});


// Cancelar edición
btnCancelar.addEventListener("click", function () {
    correo.value = correoOriginal;
    telefono.value = telefonoOriginal;

    correo.disabled = true;
    telefono.disabled = true;

    accionesEdicion.style.display = "none";
    btnEditar.style.display = "inline-block";
});


// Guardar cambios del perfil
btnGuardar.addEventListener("click", function () {
    const correoNuevo = correo.value.trim();
    const telefonoNuevo = telefono.value.replace(/\s/g, "");

    if (correoNuevo === "") {
        alert("Ingresa tu correo electrónico.");
        correo.focus();
        return;
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correoNuevo)) {
        alert("Ingresa un correo electrónico válido.");
        correo.focus();
        return;
    }

    if (!/^\d{10}$/.test(telefonoNuevo)) {
        alert("El número de teléfono debe contener 10 dígitos.");
        telefono.focus();
        return;
    }

    correo.value = correoNuevo;
    telefono.value = telefonoNuevo;

    correo.disabled = true;
    telefono.disabled = true;

    accionesEdicion.style.display = "none";
    btnEditar.style.display = "inline-block";

    correoOriginal = correo.value;
    telefonoOriginal = telefono.value;

    alert("Los datos se actualizaron correctamente.");
});


/* =========================================
   CAMBIAR Y ELIMINAR FOTO DE PERFIL
========================================= */

const inputFoto = document.getElementById("inputFoto");
const btnEliminarFoto = document.getElementById("btnEliminarFoto");
const fotoPerfil = document.getElementById("fotoPerfil");

const fotoPredeterminada = "img/perfil-default.png";


// Mostrar la foto seleccionada
inputFoto.addEventListener("change", function () {
    const archivo = inputFoto.files[0];

    if (!archivo) {
        return;
    }

    if (!archivo.type.startsWith("image/")) {
        alert("Selecciona un archivo de imagen válido.");
        inputFoto.value = "";
        return;
    }

    const lector = new FileReader();

    lector.onload = function (evento) {
        fotoPerfil.src = evento.target.result;
    };

    lector.readAsDataURL(archivo);
});


// Eliminar la foto y restaurar la predeterminada
btnEliminarFoto.addEventListener("click", function () {
    fotoPerfil.src = fotoPredeterminada;
    inputFoto.value = "";
});


/* =========================================
   MOSTRAR U OCULTAR FORMULARIO
   DE CAMBIO DE CONTRASEÑA
========================================= */

const btnMostrarContrasena =
    document.getElementById("btnMostrarContrasena");

const formularioContrasena =
    document.getElementById("formularioContrasena");

const btnGuardarContrasena =
    document.getElementById("btnGuardarContrasena");

const contrasenaActual =
    document.getElementById("contrasenaActual");

const nuevaContrasena =
    document.getElementById("nuevaContrasena");

const confirmarContrasena =
    document.getElementById("confirmarContrasena");

const mensajeContrasena =
    document.getElementById("mensajeContrasena");


// Abrir o cerrar el formulario
btnMostrarContrasena.addEventListener("click", function () {
    formularioContrasena.classList.toggle("mostrar");

    const formularioVisible =
        formularioContrasena.classList.contains("mostrar");

    btnMostrarContrasena.textContent = formularioVisible
        ? "Cancelar"
        : "Cambiar contraseña";

    if (!formularioVisible) {
        contrasenaActual.value = "";
        nuevaContrasena.value = "";
        confirmarContrasena.value = "";

        mensajeContrasena.textContent = "";
        mensajeContrasena.className = "mensaje-contrasena";

        document.querySelectorAll(".btn-mostrar").forEach(function (boton) {
            boton.textContent = "Mostrar";
        });

        document.querySelectorAll(".campo-contrasena input").forEach(function (input) {
            input.type = "password";
        });
    }
});


/* =========================================
   MOSTRAR MENSAJES DE CONTRASEÑA
========================================= */

function mostrarMensajeContrasena(texto, tipo) {
    mensajeContrasena.textContent = texto;
    mensajeContrasena.className = "mensaje-contrasena " + tipo;
}


/* =========================================
   MOSTRAR U OCULTAR CADA CONTRASEÑA
========================================= */

document.querySelectorAll(".campo-contrasena").forEach(function (campo) {
    const input = campo.querySelector("input");
    const boton = campo.querySelector(".btn-mostrar");

    if (input && boton) {
        boton.addEventListener("click", function () {
            const mostrar = input.type === "password";

            input.type = mostrar ? "text" : "password";
            boton.textContent = mostrar ? "Ocultar" : "Mostrar";
        });
    }
});


/* =========================================
   VALIDAR CAMBIO DE CONTRASEÑA
========================================= */

btnGuardarContrasena.addEventListener("click", function (evento) {
    evento.preventDefault();

    const actual = contrasenaActual.value;
    const nueva = nuevaContrasena.value;
    const confirmar = confirmarContrasena.value;

    mensajeContrasena.textContent = "";
    mensajeContrasena.className = "mensaje-contrasena";

    // Comprobar que todos los campos estén completos
    if (
        actual.trim() === "" ||
        nueva === "" ||
        confirmar === ""
    ) {
        mostrarMensajeContrasena(
            "Completa todos los campos.",
            "error"
        );
        return;
    }

    // Comprobar mínimo 8 caracteres
    if (nueva.length < 8) {
        mostrarMensajeContrasena(
            "La contraseña debe tener mínimo 8 caracteres.",
            "error"
        );
        nuevaContrasena.focus();
        return;
    }

    // Comprobar que contenga al menos un número
    if (!/[0-9]/.test(nueva)) {
        mostrarMensajeContrasena(
            "La contraseña debe contener al menos un número.",
            "error"
        );
        nuevaContrasena.focus();
        return;
    }

    // Comprobar que contenga al menos un símbolo
    if (!/[^A-Za-z0-9]/.test(nueva)) {
        mostrarMensajeContrasena(
            "La contraseña debe contener al menos un símbolo, como !, @ o #.",
            "error"
        );
        nuevaContrasena.focus();
        return;
    }

    // Comprobar que las contraseñas coincidan
    if (nueva !== confirmar) {
        mostrarMensajeContrasena(
            "La nueva contraseña y su confirmación no coinciden.",
            "error"
        );
        confirmarContrasena.focus();
        return;
    }

    // Evitar que la contraseña nueva sea igual a la actual
    if (nueva === actual) {
        mostrarMensajeContrasena(
            "La nueva contraseña debe ser diferente de la actual.",
            "error"
        );
        nuevaContrasena.focus();
        return;
    }
    // Las validaciones se completaron correctamente
alert("La contraseña se guardó correctamente.");

// Limpiar los campos de contraseña
contrasenaActual.value = "";
nuevaContrasena.value = "";
confirmarContrasena.value = "";

// Limpiar el mensaje de validación
mensajeContrasena.textContent = "";
mensajeContrasena.className = "mensaje-contrasena";

// Cerrar el formulario de cambio de contraseña
formularioContrasena.classList.remove("mostrar");

// Restaurar el texto del botón
btnMostrarContrasena.textContent = "Cambiar contraseña";

// Ocultar las contraseñas si estaban visibles
document.querySelectorAll(".campo-contrasena input").forEach(function (input) {
    input.type = "password";
});

document.querySelectorAll(".btn-mostrar").forEach(function (boton) {
    boton.textContent = "Mostrar";
});

    
});


/* =========================================
   CERRAR SESIÓN
========================================= */

const btnCerrarSesion = document.getElementById("btnCerrarSesion");

btnCerrarSesion.addEventListener("click", function () {
    const confirmarSalida = confirm(
        "¿Estás seguro de que deseas cerrar sesión?"
    );

    if (confirmarSalida) {
        window.location.href = "login.html";
    }
});
