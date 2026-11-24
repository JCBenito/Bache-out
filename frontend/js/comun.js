/* Bache-Out · Panel de administrador
   comun.js: datos reales, sesión y piezas compartidas por todas las páginas del panel */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ====== NOMBRES DE ARCHIVO (mismo nivel en frontend/) ====== */
const RUTAS = {
  login: "login.html",
  resumen: "resumen.html",
  reportes: "reportesadmin.html",
  mapa: "mapaadmin.html",
  estadisticas: "estadisticas.html",
  administrador: "administrador.html"
};

/* ====== SESIÓN Y PERFIL DEL ADMINISTRADOR ====== */
const ROLES_ADMIN = [1, 2, 3, 4, 5];

function leerUsuarioSesion() {
  try {
    const rawAdmin = localStorage.getItem("admin");
    if (rawAdmin) return JSON.parse(rawAdmin);
    const rawUser = localStorage.getItem("usuario");
    if (rawUser) return JSON.parse(rawUser);
  } catch (e) {}
  return null;
}

function borrarSesion() {
  try {
    sessionStorage.removeItem("bo_sesion");
    sessionStorage.removeItem("sesionIniciada");
    localStorage.removeItem("admin");
    localStorage.removeItem("usuario");
    localStorage.removeItem("nombreUsuario");
    localStorage.removeItem("bo_admin");
  } catch (e) {}
  window.name = "";
}

const usuarioSesion = leerUsuarioSesion();
const rolSesion = Number(usuarioSesion?.id_rol);

if (!usuarioSesion || !Number.isFinite(rolSesion)) {
  location.replace(RUTAS.login);
} else if (!ROLES_ADMIN.includes(rolSesion)) {
  // Si es Ciudadano (rol 6) u otro rol no administrativo, va a index.html
  location.replace("index.html");
}

const nombreCompletoSesion = usuarioSesion
  ? [usuarioSesion.nombres, usuarioSesion.apellido_paterno, usuarioSesion.apellido_materno]
      .filter(Boolean)
      .join(" ")
  : "Administrador Bache-Out";

const PERFIL_BASE = {
  id: usuarioSesion?.id || usuarioSesion?.id_usuario || null,
  nombre: nombreCompletoSesion || "Administrador Bache-Out",
  correo: usuarioSesion?.correo || "admin@bache-out.mx",
  tel: usuarioSesion?.telefono || "",
  cargo: usuarioSesion?.nombre_rol || "Administrador del sistema"
};

let perfil = { ...PERFIL_BASE };
try {
  const g = localStorage.getItem("bo_admin");
  if (g) {
    const guardado = JSON.parse(g);
    if (!perfil.id || guardado.id === perfil.id) {
      perfil = { ...perfil, ...guardado };
    }
  }
} catch (e) {}

const iniciales = n => n.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "AD";

/* ====== ESTADOS Y REPORTES DESDE POSTGRESQL ====== */
const ESTADOS = {
  pendiente: "Pendiente",
  reparacion: "En reparación",
  resuelto: "Resuelto",
  cancelado: "Rechazado"
};

const COLORES = {
  pendiente: "#ffbb77",
  reparacion: "#8cc4ee",
  resuelto: "#8fd9a8",
  cancelado: "#f08a82"
};

let reportes = [];
window.reportes = reportes;

const guardarReportes = () => {
  try {
    localStorage.setItem("bo_reportes", JSON.stringify(reportes));
  } catch (e) {}
};

async function cargarReportesServidor() {
  try {
    const respuesta = await fetch("/api/admin/reportes");
    if (!respuesta.ok) throw new Error("No se pudieron obtener los reportes del servidor.");

    const datos = await respuesta.json();
    reportes = Array.isArray(datos.reportes) ? datos.reportes : [];
    window.reportes = reportes;

    guardarReportes();
    renderKpis();
    avisarCambio();
  } catch (error) {
    console.error("Error al cargar reportes desde PostgreSQL:", error);
    try {
      const respaldo = JSON.parse(localStorage.getItem("bo_reportes"));
      if (Array.isArray(respaldo)) {
        reportes = respaldo;
        window.reportes = reportes;
      }
    } catch (e) {}
    renderKpis();
    avisarCambio();
    toast("No se pudo conectar con el servidor para actualizar reportes.");
  }
}

async function actualizarEstadoEnServidor(folio, estadoNuevo) {
  const respuesta = await fetch(`/api/admin/reportes/${encodeURIComponent(folio)}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: estadoNuevo })
  });

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(datos.error || "No se pudo actualizar el estado en la base de datos.");
  }
  return datos;
}

/* ====== UTILIDADES ====== */
const fmt = d => (d ? d.split("-").reverse().join("/") : "Sin fecha");
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fechaLarga = d => {
  if (!d || !d.includes("-")) return d || "Fecha no disponible";
  const [y, m, dd] = d.split("-");
  return `${dd} de ${MESES[+m - 1]} de ${y}`;
};
const badge = e => `<span class="badge b-${e}">${ESTADOS[e] || "Pendiente"}</span>`;
const count = e => reportes.filter(r => r.estado === e).length;
function toast(m) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = m;
  t.classList.add("on");
  setTimeout(() => t.classList.remove("on"), 2200);
}
const avisarCambio = () => document.dispatchEvent(new Event("reportes:cambio"));

/* ====== ESTRUCTURA COMÚN (encabezado, menú, ventanas) ====== */
const PAG = document.body.dataset.pag;
const NAV = [["resumen", "Resumen"], ["reportes", "Reportes"], ["mapa", "Mapa interactivo"], ["estadisticas", "Estadísticas"]];
document.body.insertAdjacentHTML("afterbegin", `
<header class="top">
  <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 22c0-3 6-9 14-9s12 3 12 6-6 7-13 7S3 25 3 22z" fill="#1f4f94"/><path d="M16 2a6 6 0 0 0-6 6c0 5 6 11 6 11s6-6 6-11a6 6 0 0 0-6-6z" fill="#e53935"/><circle cx="16" cy="8" r="2.2" fill="#fff"/></svg>
  <b>Bache-Out</b>
  <a class="admin-tag" href="${RUTAS.administrador}" aria-label="Abrir mi perfil"><span id="hName">${perfil.nombre.split(" ")[0]}</span><div class="avatar" id="hAv" aria-hidden="true">${iniciales(perfil.nombre)}</div></a>
</header>
<nav aria-label="Secciones del panel">${NAV.map(([k, t]) => `<a href="${RUTAS[k]}"${k === PAG ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>`);

document.body.insertAdjacentHTML("beforeend", `
<dialog id="dlg">
  <h3 id="dFolio"></h3>
  <span class="badge" id="dBadge"></span>
  <dl>
    <dt>Ubicación</dt><dd id="dUbic"></dd>
    <dt>Fecha</dt><dd id="dFecha"></dd>
    <dt>Ciudadano</dt><dd id="dUser"></dd>
  </dl>
  <label for="dEstado">Cambiar estado</label>
  <select id="dEstado">
    <option value="pendiente">Pendiente</option>
    <option value="reparacion">En reparación</option>
    <option value="resuelto">Resuelto</option>
    <option value="cancelado">Rechazado</option>
  </select>
  <div class="row"><button class="btn ghost" id="dCerrar">Cancelar</button><button class="btn" id="dGuardar">Guardar cambios</button></div>
</dialog>
<div class="toast" id="toast" role="status"></div>`);

/* Encabezado de bienvenida y tarjetas (solo en las páginas con data-hero) */
if (document.body.dataset.hero) {
  $("main").insertAdjacentHTML("afterbegin", `
  <section class="hero">
    <div><h1>Panel de <span>administración</span></h1><p>Revisa los reportes ciudadanos, actualiza su estado y da seguimiento a las reparaciones.</p></div>
  </section>
  <div class="kpis" id="kpis"></div>`);
}
function renderKpis() {
  const k = $("#kpis"); if (!k) return;
  const d = [
    ["", "Total de reportes", reportes.length, "Reportes generales"],
    ["ok", "Resueltos", count("resuelto"), "Incidentes finalizados"],
    ["rep", "En reparación", count("reparacion"), "Cuadrillas asignadas"],
    ["pen", "Pendientes", count("pendiente"), "Revisión pendiente"],
    ["can", "Rechazados", count("cancelado"), "Reportes descartados"]
  ];
  k.innerHTML = d.map(([c, t, n, s]) => `<div class="kpi ${c}"><small>${t}</small><strong>${n}</strong><span>${s}</span></div>`).join("");
}
function renderLeyenda() {
  $$("[data-legend]").forEach(l => l.innerHTML = Object.keys(ESTADOS).map(e => `<span><i style="background:${COLORES[e]}"></i>${ESTADOS[e]}</span>`).join(""));
}

/* ====== TABLA Y DETALLES ====== */
const abiertos = new Set();
const PASOS = ["pendiente", "reparacion", "resuelto"];
function detalle(r) {
  const cancel = r.estado === "cancelado";
  const i = cancel ? 0 : PASOS.indexOf(r.estado);
  const lista = cancel ? ["pendiente", "cancelado"] : PASOS;
  const foto = r.foto ? `<img src="${r.foto}" alt="Fotografía del bache del reporte ${r.folio}">` : `<div class="foto-vacia">Este reporte no tiene fotografía cargada.</div>`;
  const pasos = lista.map((p, k) => `<div class="step ${k <= i ? "on" : ""} ${p === "cancelado" ? "off" : ""}"><span>${p === "cancelado" ? "✕" : k + 1}</span>${ESTADOS[p]}</div>` + (k < lista.length - 1 ? `<i class="ln ${cancel ? "off" : k < i ? "on" : ""}"></i>` : "")).join("");
  return `<div class="det">
    <section><h4>Fotografía del reporte</h4>${foto}</section>
    <section class="info"><h4>Información del reporte</h4>
      <div><small>Fecha del reporte</small><span>${fechaLarga(r.fecha)}</span></div>
      <div><small>Ubicación</small><span>${r.dir}, Acapulco de Juárez</span></div>
      <div><small>Ciudadano que reportó</small><span>${r.user}</span></div>
      <div><small>Descripción</small><span>${r.desc}</span></div>
    </section>
    <section><h4>Seguimiento del reporte</h4><div class="steps">${pasos}</div></section>
  </div>`;
}
function rows(list, full) {
  const cols = full ? 6 : 4;
  if (!list.length) {
    return `<tbody><tr><td class="empty" colspan="${cols}">No hay reportes con esos filtros. Prueba con otra búsqueda.</td></tr></tbody>`;
  }

  return `<thead><tr><th>${full ? "Folio" : "ID de reporte"}</th><th>Colonia</th>${full ? "<th>Ciudadano</th>" : ""}<th>Fecha</th><th>Estado</th>${full ? "<th>Acciones</th>" : ""}</tr></thead><tbody>` +
    list.map(r => {
      const ab = abiertos.has(r.folio);
      const identificador = full ? r.folio : (r.id ?? r.id_reporte ?? r.folio);
      return `<tr><td><b>#${identificador}</b></td><td>${r.colonia}</td>${full ? `<td>${r.user}</td>` : ""}<td>${fmt(r.fecha)}</td><td>${badge(r.estado)}</td>` +
        (full
          ? `<td><div class="acts"><button class="link ${ab ? "on" : ""}" data-det="${r.folio}" aria-expanded="${ab}">${ab ? "Ocultar detalles" : "Ver detalles"}</button><button class="link" data-open="${r.folio}">Gestionar</button></div></td>`
          : "") +
        `</tr>` +
        (full && ab ? `<tr class="detrow"><td colspan="${cols}">${detalle(r)}</td></tr>` : "");
    }).join("") + `</tbody>`;
}

/* ====== GRÁFICAS ====== */
function renderCharts() {
  const por = {};
  reportes.forEach(r => por[r.colonia] = (por[r.colonia] || 0) + 1);
  const arr = Object.entries(por).sort((a, b) => b[1] - a[1]);
  const max = arr.length ? arr[0][1] : 1;
  $$("[data-bars]").forEach(b => b.innerHTML = arr.length
    ? arr.map(([c, n]) => `<div class="bar"><span>${c}</span><div><i style="width:${n / max * 100}%"></i></div><b>${n}</b></div>`).join("")
    : `<p style="color:#65757b;font-size:14px">Sin reportes registrados todavía.</p>`);

  const t = reportes.length;
  if (!t) {
    $$("[data-donut]").forEach(d => d.innerHTML = `<div class="donut" style="background:#e2e8f0"><div>0<small>reportes</small></div></div>`);
    return;
  }

  let acc = 0;
  const ORDEN = ["resuelto", "reparacion", "pendiente", "cancelado"];
  const seg = ORDEN.map(e => { const p = count(e) / t * 100, s = `${COLORES[e]} ${acc}% ${acc + p}%`; acc += p; return s; }).join(",");
  const lg = ORDEN.map(e => `<div><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${COLORES[e]};margin-right:6px"></i>${ESTADOS[e]} (${Math.round(count(e) / t * 100)}%)</div>`).join("");
  $$("[data-donut]").forEach(d => d.innerHTML = `<div class="donut" style="background:conic-gradient(${seg})" role="img" aria-label="Gráfica de estado de reportes"><div>${t}<small>reportes</small></div></div><div style="display:grid;gap:8px">${lg}</div>`);
}

/* ====== MAPAS (Leaflet + OpenStreetMap) ====== */
const ACAPULCO = [16.8531, -99.8237];
let ubic = null;
function pinIcon(e) { return L.divIcon({ className: "", html: `<div class="lpin" style="background:${COLORES[e]}"></div>`, iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -24] }); }
function baseMap(id, z) {
  const m = L.map(id).setView(ACAPULCO, z);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; Colaboradores de OpenStreetMap" }).addTo(m);
  return m;
}
const popupReporte = r => `<b>#${r.folio}</b><br>${r.colonia}, Acapulco<br>${fmt(r.fecha)}<br>${badge(r.estado)}<br><button class="link" data-open="${r.folio}">Gestionar</button>`;
function ponerPines(capa, lista) {
  capa.clearLayers();
  lista.forEach(r => L.marker([r.lat, r.lng], { icon: pinIcon(r.estado), title: "#" + r.folio }).addTo(capa).bindPopup(popupReporte(r)));
}
function ajustarMapa(m, lista) { if (lista.length && !ubic) m.fitBounds(L.latLngBounds(lista.map(r => [r.lat, r.lng])).pad(.2)); }
function seguirUbicacion(mapas, estado) {
  const mk = [], ci = []; let centrado = false;
  if (!("geolocation" in navigator)) { estado("Tu navegador no admite geolocalización.", false); return null; }
  estado("Solicitando tu ubicación… acepta el permiso del navegador.", false);
  return navigator.geolocation.watchPosition(p => {
    ubic = [p.coords.latitude, p.coords.longitude]; const ac = p.coords.accuracy;
    mapas.forEach((m, i) => {
      if (!mk[i]) {
        mk[i] = L.marker(ubic, { icon: L.divIcon({ className: "", html: '<div class="me"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 1000 }).addTo(m).bindPopup("Estás aquí");
        ci[i] = L.circle(ubic, { radius: ac, color: "#1f6fe5", weight: 1, fillOpacity: .1 }).addTo(m);
      } else { mk[i].setLatLng(ubic); ci[i].setLatLng(ubic).setRadius(ac); }
    });
    if (!centrado) { mapas.forEach(m => m.setView(ubic, 15)); centrado = true; }
    estado(`Ubicación en tiempo real activa · precisión ±${Math.round(ac)} m`, true);
  }, err => {
    const m = { 1: "Permiso de ubicación denegado. Actívalo en el candado de la barra de direcciones.", 2: "No se pudo determinar tu ubicación.", 3: "La ubicación tardó demasiado en responder." };
    estado(m[err.code] || "Error de ubicación.", false);
  }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
}

/* ====== VENTANA "GESTIONAR" ====== */
let actual = null;
document.addEventListener("click", e => {
  const b = e.target.closest("[data-open]"); if (!b) return;
  actual = reportes.find(r => r.folio === b.dataset.open);
  if (!actual) return;
  $("#dFolio").textContent = "Reporte #" + actual.folio;
  $("#dBadge").className = "badge b-" + actual.estado;
  $("#dBadge").textContent = ESTADOS[actual.estado];
  $("#dUbic").textContent = actual.dir + ", Acapulco";
  $("#dFecha").textContent = fmt(actual.fecha);
  $("#dUser").textContent = actual.user;
  $("#dEstado").value = actual.estado;
  $("#dlg").showModal();
});
$("#dCerrar").onclick = () => $("#dlg").close();
$("#dGuardar").onclick = async () => {
  if (!actual) return;
  const nuevoEstado = $("#dEstado").value;
  const btnGuardar = $("#dGuardar");
  btnGuardar.disabled = true;
  btnGuardar.textContent = "Guardando...";

  try {
    await actualizarEstadoEnServidor(actual.folio, nuevoEstado);
    actual.estado = nuevoEstado;
    guardarReportes();
    $("#dlg").close();
    avisarCambio();
    toast("Estado actualizado a " + ESTADOS[actual.estado]);
  } catch (error) {
    toast(error.message || "Error al actualizar estado");
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = "Guardar cambios";
  }
};

document.addEventListener("reportes:cambio", renderKpis);
renderKpis();
renderLeyenda();
cargarReportesServidor();
