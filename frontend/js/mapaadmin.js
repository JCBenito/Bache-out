/* Bache-Out · Mapa interactivo */
const map = baseMap("liveMap", 13);
const capa = L.layerGroup().addTo(map);

const conCoords = lista =>
  lista.filter(r => Number.isFinite(Number(r.lat)) && Number.isFinite(Number(r.lng)));

const filtrados = () => {
  const f = $("#mapFiltro").value;
  return conCoords(reportes).filter(r => !f || r.estado === f);
};

const setStatus = (t, on) => {
  $("#geoStatus").innerHTML = `<i class="dot ${on ? "on" : ""}"></i>${t}`;
};

let ajusteInicialHecho = false;

const pintar = () => {
  const lista = filtrados();
  ponerPines(capa, lista, false);
  if (!ajusteInicialHecho && lista.length) {
    ajustarMapa(map, lista);
    ajusteInicialHecho = true;
  }
  setTimeout(() => map.invalidateSize(), 50);
};

pintar();
let watch = seguirUbicacion([map], setStatus);

$("#mapFiltro").onchange = pintar;
$("#btnCentrar").onclick = () => {
  if (ubic) map.setView(ubic, 16);
  else {
    watch = seguirUbicacion([map], setStatus);
    toast("Buscando tu ubicación…");
  }
};
$("#btnTodos").onclick = () => {
  const l = filtrados();
  if (l.length) map.fitBounds(L.latLngBounds(l.map(r => [Number(r.lat), Number(r.lng)])).pad(0.2));
};
document.addEventListener("reportes:cambio", pintar);
