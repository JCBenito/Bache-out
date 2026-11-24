
/* =========================================
   HELPER PARA OBTENER SESIÓN ACTUAL
========================================= */

function obtenerUsuarioSesion() {
    try {
        const sesionCruda = localStorage.getItem("usuario");

        if (sesionCruda) {
            const parsed = JSON.parse(sesionCruda);
            return parsed.usuario || parsed;
        }

    } catch (e) {
        console.error("Error al leer la sesión", e);
    }

    return null;
}


/* =========================================
   ELEMENTOS DE LA FOTO DE PERFIL
========================================= */

const fotoPerfil = document.getElementById("fotoPerfil");
const contenedorFoto = document.getElementById("contenedorFoto");
const avatarPredeterminado = document.getElementById("avatarPredeterminado");

// Mostrar fotografía o avatar predeterminado
function mostrarFotoPerfil(origen) {

    if (!fotoPerfil || !contenedorFoto) return;

    // Si no existe fotografía, mostrar avatar
    if (!origen) {
        fotoPerfil.removeAttribute("src");
        contenedorFoto.classList.remove("con-foto");
        return;
    }

    // Verificar que la fotografía cargue correctamente
    fotoPerfil.onload = function () {
        contenedorFoto.classList.add("con-foto");
    };

    fotoPerfil.onerror = function () {
        contenedorFoto.classList.remove("con-foto");
        fotoPerfil.removeAttribute("src");
    };

    fotoPerfil.src = origen;
}


/* =========================================
   CARGAR DATOS DEL USUARIO AL INICIAR
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    // 1. Validar sesión
    const usuarioLogueado = obtenerUsuarioSesion();

    if (!usuarioLogueado || !usuarioLogueado.id) {
        window.location.href = "login.html";
        return;
    }

    // 2. Obtener datos del usuario
    const nombresValor = usuarioLogueado.nombres || "";
    const apellidoPaternoValor = usuarioLogueado.apellido_paterno || "";
    const apellidoMaternoValor = usuarioLogueado.apellido_materno || "";
    const correoValor = usuarioLogueado.correo || "";
    const telefonoValor = usuarioLogueado.telefono || "";

    // Capitalizar nombres
    const capitalizar = (texto) =>
        texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : "";

    const nF = capitalizar(nombresValor);
    const apP = capitalizar(apellidoPaternoValor);
    const apM = capitalizar(apellidoMaternoValor);

    // 3. Rellenar información personal
    const nombresInput = document.getElementById("nombres");
    const apellidoPaternoInput = document.getElementById("apellidoPaterno");
    const apellidoMaternoInput = document.getElementById("apellidoMaterno");
    const correoInput = document.getElementById("correo");
    const telefonoInput = document.getElementById("telefono");
    const nombreMostrar = document.getElementById("nombreMostrar");

    if (nombresInput) nombresInput.value = nF;
    if (apellidoPaternoInput) apellidoPaternoInput.value = apP;
    if (apellidoMaternoInput) apellidoMaternoInput.value = apM;
    if (correoInput) correoInput.value = correoValor;
    if (telefonoInput) telefonoInput.value = telefonoValor;

    if (nombreMostrar) {
        nombreMostrar.textContent = `${nF} ${apP} ${apM}`;
    }

    correoOriginal = correoInput ? correoInput.value : "";
    telefonoOriginal = telefonoInput ? telefonoInput.value : "";

    // 4. Cargar fotografía guardada localmente
    const claveFoto = `foto_perfil_${usuarioLogueado.id}`;

    const fotoGuardadaLocal = localStorage.getItem(claveFoto);

    if (fotoGuardadaLocal) {
        mostrarFotoPerfil(fotoGuardadaLocal);
    } else {
        mostrarFotoPerfil("");
    }

    // 5. Consultar fotografía del servidor
    try {

        const respFoto = await fetch(
            `/api/foto-perfil/${usuarioLogueado.id}`
        );

        if (respFoto.ok) {

            const dataFoto = await respFoto.json();

            if (dataFoto.foto_perfil) {

                mostrarFotoPerfil(dataFoto.foto_perfil);

                localStorage.setItem(
                    claveFoto,
                    dataFoto.foto_perfil
                );

            } else {

                mostrarFotoPerfil("");

                localStorage.removeItem(claveFoto);
            }
        }

    } catch (err) {

        console.error(
            "No se pudo verificar la foto en el servidor:",
            err
        );
    }
});


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

let correoOriginal = "";
let telefonoOriginal = "";


// Activar edición
if (btnEditar) {

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
}


// Cancelar edición
if (btnCancelar) {

    btnCancelar.addEventListener("click", function () {

        correo.value = correoOriginal;
        telefono.value = telefonoOriginal;

        correo.disabled = true;
        telefono.disabled = true;

        accionesEdicion.style.display = "none";
        btnEditar.style.display = "inline-block";
    });
}


// Guardar cambios del perfil en la base de datos
if (btnGuardar) {

    btnGuardar.addEventListener("click", async function () {

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

        const usuarioLogueado = obtenerUsuarioSesion();

        if (!usuarioLogueado || !usuarioLogueado.id) {
            alert("No se encontró una sesión activa.");
            window.location.href = "login.html";
            return;
        }

        try {

            const respuesta = await fetch('/api/actualizar-perfil', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_usuario: usuarioLogueado.id,
                    correo: correoNuevo,
                    telefono: telefonoNuevo
                })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.error || "No se pudo actualizar el perfil."
                );
            }

            correo.value = correoNuevo;
            telefono.value = telefonoNuevo;

            correo.disabled = true;
            telefono.disabled = true;

            accionesEdicion.style.display = "none";
            btnEditar.style.display = "inline-block";

            correoOriginal = correo.value;
            telefonoOriginal = telefono.value;

            usuarioLogueado.correo = correoNuevo;
            usuarioLogueado.telefono = telefonoNuevo;

            localStorage.setItem(
                "usuario",
                JSON.stringify(usuarioLogueado)
            );

            alert(
                "¡Los datos se actualizaron correctamente en la base de datos!"
            );

        } catch (error) {

            alert(
                error.message || "Error al conectar con el servidor."
            );
        }
    });
}


/* =========================================
   CAMBIAR Y ELIMINAR FOTO DE PERFIL
========================================= */

const inputFoto = document.getElementById("inputFoto");
const btnEliminarFoto = document.getElementById("btnEliminarFoto");


// Subir y guardar fotografía
if (inputFoto) {

    inputFoto.addEventListener("change", async function () {

        const archivo = inputFoto.files[0];

        if (!archivo) return;

        if (!archivo.type.startsWith("image/")) {

            alert("Selecciona un archivo de imagen válido.");
            inputFoto.value = "";
            return;
        }

        const usuarioLogueado = obtenerUsuarioSesion();

        if (!usuarioLogueado || !usuarioLogueado.id) {

            alert("No se encontró una sesión activa.");
            return;
        }

        // Vista previa de la fotografía
        const lector = new FileReader();

        lector.onload = function (evento) {

            mostrarFotoPerfil(evento.target.result);
        };

        lector.readAsDataURL(archivo);

        // Preparar archivo para enviarlo al servidor
        const formData = new FormData();

        formData.append("id_usuario", usuarioLogueado.id);
        formData.append("foto_perfil", archivo);

        try {

            const respuesta = await fetch("/api/foto-perfil", {
                method: "POST",
                body: formData
            });

            const resultado = await respuesta.json();

            if (respuesta.ok && resultado.foto_perfil) {

                mostrarFotoPerfil(resultado.foto_perfil);

                localStorage.setItem(
                    `foto_perfil_${usuarioLogueado.id}`,
                    resultado.foto_perfil
                );

            } else {

                mostrarFotoPerfil(
                    localStorage.getItem(
                        `foto_perfil_${usuarioLogueado.id}`
                    )
                );

                alert(
                    resultado.error ||
                    "No se pudo guardar la foto en el servidor."
                );
            }

        } catch (error) {

            console.error("Error al subir la foto:", error);

            alert(
                "Error de conexión al guardar la foto de perfil."
            );

            mostrarFotoPerfil(
                localStorage.getItem(
                    `foto_perfil_${usuarioLogueado.id}`
                )
            );
        }
    });
}


// Eliminar fotografía y restaurar avatar
if (btnEliminarFoto) {

    btnEliminarFoto.addEventListener("click", async function () {

        const usuarioLogueado = obtenerUsuarioSesion();

        if (!usuarioLogueado || !usuarioLogueado.id) {
            alert("No se encontró una sesión activa.");
            return;
        }

        const confirmar = confirm(
            "¿Estás seguro de que deseas eliminar tu foto de perfil?"
        );

        if (!confirmar) return;

        try {

            const respuesta = await fetch(
                `/api/foto-perfil/${usuarioLogueado.id}`,
                {
                    method: "DELETE"
                }
            );

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    resultado.error || "No se pudo eliminar la fotografía."
                );
            }

            localStorage.removeItem(
                `foto_perfil_${usuarioLogueado.id}`
            );

            mostrarFotoPerfil("");

            if (inputFoto) {
                inputFoto.value = "";
            }

            alert("La fotografía se eliminó correctamente.");

        } catch (error) {

            alert(
                error.message || "Error al eliminar la fotografía."
            );

            console.error(error);
        }
    });
}


/* =========================================
   MOSTRAR U OCULTAR FORMULARIO
   DE CAMBIO DE CONTRASEÑA
========================================= */

const btnMostrarContrasena = document.getElementById("btnMostrarContrasena");
const formularioContrasena = document.getElementById("formularioContrasena");
const btnGuardarContrasena = document.getElementById("btnGuardarContrasena");

const contrasenaActual = document.getElementById("contrasenaActual");
const nuevaContrasena = document.getElementById("nuevaContrasena");
const confirmarContrasena = document.getElementById("confirmarContrasena");

const mensajeContrasena = document.getElementById("mensajeContrasena");


if (btnMostrarContrasena && formularioContrasena) {

    btnMostrarContrasena.addEventListener("click", function () {

        formularioContrasena.classList.toggle("mostrar");

        const formularioVisible =
            formularioContrasena.classList.contains("mostrar");

        btnMostrarContrasena.textContent = formularioVisible
            ? "Cancelar"
            : "Cambiar contraseña";

        if (!formularioVisible) {

            if (contrasenaActual) contrasenaActual.value = "";
            if (nuevaContrasena) nuevaContrasena.value = "";
            if (confirmarContrasena) confirmarContrasena.value = "";

            if (mensajeContrasena) {

                mensajeContrasena.textContent = "";
                mensajeContrasena.className = "mensaje-contrasena";
            }

            document.querySelectorAll(".btn-mostrar").forEach(
                function (boton) {
                    boton.textContent = "Mostrar";
                }
            );

            document.querySelectorAll(".campo-contrasena input").forEach(
                function (input) {
                    input.type = "password";
                }
            );
        }
    });
}


/* =========================================
   MOSTRAR MENSAJES DE CONTRASEÑA
========================================= */

function mostrarMensajeContrasena(texto, tipo) {

    if (mensajeContrasena) {

        mensajeContrasena.textContent = texto;
        mensajeContrasena.className =
            "mensaje-contrasena " + tipo;
    }
}


/* =========================================
   MOSTRAR U OCULTAR CADA CONTRASEÑA
========================================= */

document.querySelectorAll(".campo-contrasena").forEach(
    function (campo) {

        const input = campo.querySelector("input");
        const boton = campo.querySelector(".btn-mostrar");

        if (input && boton) {

            boton.addEventListener("click", function () {

                const mostrar = input.type === "password";

                input.type = mostrar ? "text" : "password";

                boton.textContent = mostrar
                    ? "Ocultar"
                    : "Mostrar";
            });
        }
    }
);


/* =========================================
   VALIDAR Y GUARDAR CAMBIO DE CONTRASEÑA
========================================= */

if (btnGuardarContrasena) {

    btnGuardarContrasena.addEventListener("click", async function (evento) {

        evento.preventDefault();

        const actual = contrasenaActual.value;
        const nueva = nuevaContrasena.value;
        const confirmar = confirmarContrasena.value;

        if (mensajeContrasena) {

            mensajeContrasena.textContent = "";
            mensajeContrasena.className = "mensaje-contrasena";
        }

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

        if (nueva.length < 8) {

            mostrarMensajeContrasena(
                "La contraseña debe tener mínimo 8 caracteres.",
                "error"
            );

            nuevaContrasena.focus();
            return;
        }

        if (!/[0-9]/.test(nueva)) {

            mostrarMensajeContrasena(
                "La contraseña debe contener al menos un número.",
                "error"
            );

            nuevaContrasena.focus();
            return;
        }

        if (!/[^A-Za-z0-9]/.test(nueva)) {

            mostrarMensajeContrasena(
                "La contraseña debe contener al menos un símbolo, como !, @ o #.",
                "error"
            );

            nuevaContrasena.focus();
            return;
        }

        if (nueva !== confirmar) {

            mostrarMensajeContrasena(
                "La nueva contraseña y su confirmación no coinciden.",
                "error"
            );

            confirmarContrasena.focus();
            return;
        }

        if (nueva === actual) {

            mostrarMensajeContrasena(
                "La nueva contraseña debe ser diferente de la actual.",
                "error"
            );

            nuevaContrasena.focus();
            return;
        }

        const usuarioLogueado = obtenerUsuarioSesion();

        if (!usuarioLogueado || !usuarioLogueado.id) {

            alert("No se encontró una sesión activa.");
            window.location.href = "login.html";
            return;
        }

        try {

            const respuesta = await fetch('/api/actualizar-contrasena', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_usuario: usuarioLogueado.id,
                    contrasenaActual: actual,
                    nuevaContrasena: nueva
                })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {

                throw new Error(
                    datos.error ||
                    "No se pudo actualizar la contraseña."
                );
            }

            alert(
                "¡La contraseña se actualizó correctamente en la base de datos!"
            );

            contrasenaActual.value = "";
            nuevaContrasena.value = "";
            confirmarContrasena.value = "";

            if (mensajeContrasena) {

                mensajeContrasena.textContent = "";
                mensajeContrasena.className = "mensaje-contrasena";
            }

            formularioContrasena.classList.remove("mostrar");

            btnMostrarContrasena.textContent =
                "Cambiar contraseña";

            document.querySelectorAll(".campo-contrasena input").forEach(
                function (input) {
                    input.type = "password";
                }
            );

            document.querySelectorAll(".btn-mostrar").forEach(
                function (boton) {
                    boton.textContent = "Mostrar";
                }
            );

        } catch (error) {

            mostrarMensajeContrasena(
                error.message || "Error al conectar con el servidor.",
                "error"
            );
        }
    });
}


/* =========================================
   CERRAR SESIÓN
========================================= */

const btnCerrarSesion = document.getElementById("btnCerrarSesion");

if (btnCerrarSesion) {

    btnCerrarSesion.addEventListener("click", function () {

        const confirmarSalida = confirm(
            "¿Estás seguro de que deseas cerrar sesión?"
        );

        if (confirmarSalida) {

            // Conservar la fotografía guardada de cada usuario
            localStorage.removeItem("usuario");

            sessionStorage.clear();

            window.location.href = "login.html";
        }
    });
}
