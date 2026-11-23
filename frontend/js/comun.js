/* Bache-Out · Panel de administrador
   comun.js: datos, sesión y piezas compartidas por todas las páginas (menos login) */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ====== NOMBRES DE ARCHIVO ======
   Si renombraste alguna página (por ejemplo login.html → loginadmin.html),
   cambia aquí el nombre y todos los enlaces del panel se ajustan solos. */
const RUTAS = {
  login: "../login.html",
  resumen: "resumen.html",
  reportes: "reportes.html",
  mapa: "mapaadmin.html",
  estadisticas: "estadisticas.html",
  administrador: "administrador.html"
};

/* ====== SESIÓN ====== */
/* Sesión: usa sessionStorage y, si el navegador lo bloquea (pasa al abrir archivos con doble clic), window.name */
function leerSesion() {
  try { const s = sessionStorage.getItem("bo_sesion"); if (s) return s; } catch (e) {}
  const m = /(?:^|;)bo_sesion=([^;]*)/.exec(window.name || ""); return m ? decodeURIComponent(m[1]) : null;
}
function guardarSesion(c) { try { sessionStorage.setItem("bo_sesion", c); } catch (e) {} window.name = "bo_sesion=" + encodeURIComponent(c); }
function borrarSesion() { try { sessionStorage.removeItem("bo_sesion"); } catch (e) {} window.name = ""; }
const sesion = leerSesion();
//if (!sesion) location.replace(RUTAS.login);

/* ====== DATOS ====== (reemplaza REPORTES_BASE con tu base de datos) */
const ESTADOS = { pendiente: "Pendiente", reparacion: "En reparación", resuelto: "Resuelto", cancelado: "Cancelado" };
const COLORES = { pendiente: "#ffbb77", reparacion: "#8cc4ee", resuelto: "#8fd9a8", cancelado: "#f08a82" };
const REPORTES_BASE = [
  { folio: "8CH-0031", colonia: "Icacos", dir: "Calle Icacos esq. Av. Universidad", fecha: "2026-10-05", estado: "pendiente", user: "Laura Pineda", desc: "Bache profundo frente a la parada del camión, los autos tienen que invadir el otro carril.", foto: "", lat: 16.8465, lng: -99.8760 },
  { folio: "8CH-0030", colonia: "Costa Azul", dir: "Av. Costera Miguel Alemán", fecha: "2026-10-04", estado: "reparacion", user: "Jorge Nava", desc: "Bache de gran tamaño ubicado sobre el carril derecho de la avenida.", foto: "", lat: 16.8630, lng: -99.8650 },
  { folio: "8CH-0029", colonia: "Renacimiento", dir: "Av. Renacimiento 120", fecha: "2026-10-03", estado: "reparacion", user: "Karen Ortiz", desc: "Hundimiento del pavimento después de las lluvias, cerca de una escuela.", foto: "", lat: 16.8760, lng: -99.7980 },
  { folio: "8CH-0028", colonia: "Mozimba", dir: "Calle Mozimba s/n", fecha: "2026-10-02", estado: "resuelto", user: "Iván Castro", desc: "Varios baches pequeños seguidos sobre la calle principal.", foto: "", lat: 16.8590, lng: -99.8890 },
  { folio: "8CH-0027", colonia: "Centro", dir: "Calle La Quebrada y 5 de Mayo", fecha: "2026-10-01", estado: "pendiente", user: "Paola Reyes", desc: "Bache en el cruce que dificulta el paso de bicicletas y motos.", foto: "", lat: 16.8512, lng: -99.9100 },
  { folio: "8CH-0026", colonia: "Costa Azul", dir: "Blvd. Costa Azul 45", fecha: "2026-09-30", estado: "reparacion", user: "Hugo Mendoza", desc: "Bache junto a la banqueta, ya dañó llantas de varios vehículos.", foto: "", lat: 16.8280, lng: -99.8650 },
  { folio: "8CH-0025", colonia: "Farallón", dir: "Camino al Farallón km 2", fecha: "2026-09-29", estado: "resuelto", user: "Daniela Gil", desc: "Grieta amplia con desprendimiento de asfalto en la curva.", foto: "", lat: 16.8395, lng: -99.8530 },
  { folio: "8CH-0024", colonia: "El Cayaco", dir: "C. 10 de Mayo, El Cayaco", fecha: "2026-09-28", estado: "pendiente", user: "Raúl Herrera", desc: "Bache grande lleno de agua, no se ve de noche.", foto: "", lat: 16.9010, lng: -99.8200 },
  { folio: "8CH-0023", colonia: "Alta Tensión", dir: "C. Alta Tensión 78", fecha: "2026-09-27", estado: "reparacion", user: "Mónica Soto", desc: "Bache en la entrada de la colonia, afecta a camiones de carga.", foto: "", lat: 16.8720, lng: -99.8520 },
  { folio: "8CH-0022", colonia: "Hornos", dir: "Av. Hornos esq. Gran Vía Tropical", fecha: "2026-09-26", estado: "resuelto", user: "Andrés Lara", desc: "Bache en el carril central, frente a un comercio.", foto: "", lat: 16.8340, lng: -99.8910 }
];

/* Los reportes (y sus cambios de estado) se guardan en el navegador para que
   todas las páginas los compartan. Con tu servidor, cámbialo por fetch(). */
let reportes;
try {
  const g = JSON.parse(localStorage.getItem("bo_reportes"));
  reportes = Array.isArray(g) ? g : REPORTES_BASE.map(r => ({ ...r }));
} catch (e) { reportes = REPORTES_BASE.map(r => ({ ...r })); }
const guardarReportes = () => { try { localStorage.setItem("bo_reportes", JSON.stringify(reportes)); } catch (e) {} };

/* ====== PERFIL ====== */
const PERFIL_BASE = { nombre: "Administrador Bache-Out", correo: "admin@bache-out.mx", tel: "+52 744 000 0000", cargo: "Administrador del sistema" };
let perfil = { ...PERFIL_BASE };
try {
  const g = localStorage.getItem("bo_admin");
  if (g) perfil = { ...perfil, ...JSON.parse(g) }; else perfil.correo = sesion || perfil.correo;
} catch (e) {}
const iniciales = n => n.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "AD";

/* ====== UTILIDADES ====== */
const fmt = d => d.split("-").reverse().join("/");
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fechaLarga = d => { const [y, m, dd] = d.split("-"); return `${dd} de ${MESES[+m - 1]} de ${y}`; };
const badge = e => `<span class="badge b-${e}">${ESTADOS[e]}</span>`;
const count = e => reportes.filter(r => r.estado === e).length;
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); setTimeout(() => t.classList.remove("on"), 2200); }
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
    <option value="cancelado">Cancelado</option>
  </select>
  <div class="row"><button class="btn ghost" id="dCerrar">Cancelar</button><button class="btn" id="dGuardar">Guardar cambios</button></div>
</dialog>
<div class="toast" id="toast" role="status"></div>`);

/* Encabezado de bienvenida y tarjetas (solo en las páginas con data-hero) */
if (document.body.dataset.hero) {
  $("main").insertAdjacentHTML("afterbegin", `
  <section class="hero">
    <div><h1>Panel de <span>administración</span></h1><p>Revisa los reportes ciudadanos, actualiza su estado y da seguimiento a las reparaciones.</p></div>
    <div style="display:flex;gap:10px"><a class="btn" href="${RUTAS.reportes}?estado=pendiente">Ver pendientes</a><button class="btn ghost" id="exportCsv">Exportar CSV</button></div>
  </section>
  <div class="kpis" id="kpis"></div>`);
}
function renderKpis() {
  const k = $("#kpis"); if (!k) return;
  const d = [["", "Total de reportes", reportes.length, "Reportes generales"], ["ok", "Resueltos", count("resuelto"), "Incidentes finalizados"],
             ["rep", "En reparación", count("reparacion"), "Cuadrillas asignadas"], ["pen", "Pendientes", count("pendiente"), "Revisión pendiente"],
             ["can", "Cancelados", count("cancelado"), "Reportes descartados"]];
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
  if (!list.length) return `<tbody><tr><td class="empty" colspan="6">No hay reportes con esos filtros. Prueba con otra búsqueda.</td></tr></tbody>`;
  return `<thead><tr><th>Folio</th><th>Colonia</th>${full ? "<th>Ciudadano</th>" : ""}<th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>` +
    list.map(r => {
      const ab = abiertos.has(r.folio);
      return `<tr><td><b>#${r.folio}</b></td><td>${r.colonia}</td>${full ? `<td>${r.user}</td>` : ""}<td>${fmt(r.fecha)}</td><td>${badge(r.estado)}</td>
        <td><div class="acts">${full ? `<button class="link ${ab ? "on" : ""}" data-det="${r.folio}" aria-expanded="${ab}">${ab ? "Ocultar detalles" : "Ver detalles"}</button>` : ""}<button class="link" data-open="${r.folio}">Gestionar</button></div></td></tr>` +
        (full && ab ? `<tr class="detrow"><td colspan="6">${detalle(r)}</td></tr>` : "");
    }).join("") + `</tbody>`;
}

/* ====== GRÁFICAS ====== */
function renderCharts() {
  const por = {}; reportes.forEach(r => por[r.colonia] = (por[r.colonia] || 0) + 1);
  const arr = Object.entries(por).sort((a, b) => b[1] - a[1]), max = arr[0][1];
  $$("[data-bars]").forEach(b => b.innerHTML = arr.map(([c, n]) => `<div class="bar"><span>${c}</span><div><i style="width:${n / max * 100}%"></i></div><b>${n}</b></div>`).join(""));
  const t = reportes.length; let acc = 0;
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
/* Sigue la ubicación real del dispositivo y la dibuja en uno o varios mapas */
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
  $("#dFolio").textContent = "Reporte #" + actual.folio;
  $("#dBadge").className = "badge b-" + actual.estado; $("#dBadge").textContent = ESTADOS[actual.estado];
  $("#dUbic").textContent = actual.dir + ", Acapulco"; $("#dFecha").textContent = fmt(actual.fecha); $("#dUser").textContent = actual.user;
  $("#dEstado").value = actual.estado; $("#dlg").showModal();
});
$("#dCerrar").onclick = () => $("#dlg").close();
$("#dGuardar").onclick = () => {
  actual.estado = $("#dEstado").value; guardarReportes(); /* aquí harías fetch/PUT a tu servidor */
  $("#dlg").close(); avisarCambio(); toast("Estado actualizado a " + ESTADOS[actual.estado]);
};

/* ====== EXPORTAR CSV ====== */
document.addEventListener("click", e => {
  if (e.target.id !== "exportCsv") return;
  const csv = "Folio,Ubicación,Ciudadano,Fecha,Estado\n" + reportes.map(r => [r.folio, `"${r.dir}"`, r.user, r.fecha, ESTADOS[r.estado]].join(",")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "reportes-bache-out.csv"; a.click();
  toast("Archivo CSV descargado");
});

document.addEventListener("reportes:cambio", renderKpis);
renderKpis(); renderLeyenda();
