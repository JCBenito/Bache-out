/* Bache-Out · Mapa interactivo */
const map = baseMap("liveMap", 13);
const capa = L.layerGroup().addTo(map);
const filtrados = () => { const f = $("#mapFiltro").value; return reportes.filter(r => !f || r.estado === f); };
const setStatus = (t, on) => $("#geoStatus").innerHTML = `<i class="dot ${on ? "on" : ""}"></i>${t}`;

const pintar = () => ponerPines(capa, filtrados());
pintar();
ajustarMapa(map, reportes);
let watch = seguirUbicacion([map], setStatus);

$("#mapFiltro").onchange = pintar;
$("#btnCentrar").onclick = () => {
  if (ubic) map.setView(ubic, 16);
  else { watch = seguirUbicacion([map], setStatus); toast("Buscando tu ubicación…"); }
};
$("#btnTodos").onclick = () => { const l = filtrados(); if (l.length) map.fitBounds(L.latLngBounds(l.map(r => [r.lat, r.lng])).pad(.2)); };
document.addEventListener("reportes:cambio", pintar);
