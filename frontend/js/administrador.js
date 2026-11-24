/* =========================================
   PERFIL DEL ADMINISTRADOR
========================================= */

const P = {
    nombres: "#pNombres",
    paterno: "#pPaterno",
    materno: "#pMaterno",
    correo: "#pCorreo",
    tel: "#pTel",
    cargo: "#pCargo"
};


/* =========================================
   SEPARAR NOMBRE COMPLETO
========================================= */

function separarNombre(nombreCompleto) {

    const partes = (nombreCompleto || "").trim().split(/\s+/);

    return {
        nombres: partes.shift() || "",
        paterno: partes.shift() || "",
        materno: partes.join(" ")
    };
}


/* =========================================
   MOSTRAR INFORMACIÓN DEL PERFIL
========================================= */

function pintarPerfil() {

    const partes = separarNombre(perfil.nombre);

    $(P.nombres).value = partes.nombres;
    $(P.paterno).value = partes.paterno;
    $(P.materno).value = partes.materno;

    $(P.correo).value = perfil.correo || "";
    $(P.tel).value = perfil.tel || "";
    $(P.cargo).value = perfil.cargo || "";

    $("#pTitulo").textContent = perfil.nombre;
    $("#pSub").textContent = perfil.cargo;

    $("#pAv").textContent = iniciales(perfil.nombre);
    $("#hAv").textContent = iniciales(perfil.nombre);
    $("#hName").textContent = partes.nombres;
}


/* =========================================
   ACTIVAR / DESACTIVAR EDICIÓN
========================================= */

function editando(on) {

    Object.entries(P).forEach(([k, id]) => {

        // El correo nunca se puede modificar
        if (k !== "correo") {
            $(id).disabled = !on;
        }

    });

    $("#pEditar").hidden = on;
    $("#pGuardar").hidden = !on;
    $("#pCancelar").hidden = !on;

    $$("[data-err]").forEach(e => e.textContent = "");

    if (on) {
        $(P.nombres).focus();
    }
}


/* =========================================
   VALIDAR CAMPOS
========================================= */

function validar() {

    const errores = {};

    const valor = k => $(P[k]).value.trim();

    // Solo letras y espacios
    const soloLetras = /^[\p{L}]+(?:\s+[\p{L}]+)*$/u;

    // Validar nombres y apellidos
    ["nombres", "paterno", "materno"].forEach(campo => {

        const texto = valor(campo);

        if (!texto) {
            errores[campo] = "Este campo es obligatorio.";
        }
        else if (!soloLetras.test(texto)) {
            errores[campo] = "Solo se permiten letras y espacios.";
        }
        else if (texto.replace(/\s/g, "").length < 3) {
            errores[campo] = "Debe contener mínimo 3 letras.";
        }

    });

    // Validar correo
    if (!valor("correo")) {
        errores.correo = "El correo electrónico es obligatorio.";
    }

    // Validar teléfono
    const telefono = valor("tel");

    if (!telefono) {
        errores.tel = "El teléfono es obligatorio.";
    }
    else if (!/^[0-9]{10}$/.test(telefono)) {
        errores.tel = "El teléfono debe contener exactamente 10 dígitos.";
    }

    // Validar cargo
    if (!valor("cargo")) {
        errores.cargo = "Debes seleccionar un cargo.";
    }

    // Mostrar errores
    $$("[data-err]").forEach(el => {
        el.textContent = errores[el.dataset.err] || "";
    });

    return Object.keys(errores).length === 0;
}


/* =========================================
   PERMITIR ÚNICAMENTE NÚMEROS EN TELÉFONO
========================================= */

$(P.tel).addEventListener("input", function () {

    this.value = this.value.replace(/\D/g, "").slice(0, 10);

});


/* =========================================
   PERMITIR ÚNICAMENTE LETRAS Y ESPACIOS
========================================= */

["nombres", "paterno", "materno"].forEach(campo => {

    $(P[campo]).addEventListener("input", function () {

        this.value = this.value.replace(/[^\p{L}\s]/gu, "");

    });

});


/* =========================================
   BOTÓN EDITAR
========================================= */

$("#pEditar").onclick = () => {

    editando(true);

};


/* =========================================
   BOTÓN CANCELAR
========================================= */

$("#pCancelar").onclick = () => {

    pintarPerfil();
    editando(false);

};


/* =========================================
   GUARDAR CAMBIOS
========================================= */

$("#pGuardar").onclick = () => {

    if (!validar()) return;

    const nombres = $(P.nombres).value.trim().replace(/\s+/g, " ");
    const paterno = $(P.paterno).value.trim().replace(/\s+/g, " ");
    const materno = $(P.materno).value.trim().replace(/\s+/g, " ");

    // Construir nuevamente el nombre completo
    const nombreCompleto = `${nombres} ${paterno} ${materno}`;

    perfil.nombre = nombreCompleto;
    perfil.tel = $(P.tel).value.trim();
    perfil.cargo = $(P.cargo).value;

    try {

        localStorage.setItem("bo_admin", JSON.stringify(perfil));

    } catch (e) {

        console.error("No se pudieron guardar los cambios:", e);
        toast("No se pudieron guardar los cambios.");
        return;

    }

    pintarPerfil();
    editando(false);

    toast("Perfil actualizado correctamente.");

};


/* =========================================
   CERRAR SESIÓN
========================================= */

$("#pSalir").onclick = () => {

    $("#dSalir").showModal();

};

$("#sNo").onclick = () => {

    $("#dSalir").close();

};

$("#sSi").onclick = () => {

    borrarSesion();

    location.href = RUTAS.login + "?salio=1";

};


/* =========================================
   INICIALIZAR PERFIL
========================================= */

pintarPerfil();
