/* Bache-Out · Reportes */
function pintar() {
  const q = $("#q").value.toLowerCase(), f = $("#fEstado").value;
  const lista = reportes.filter(r => (!f || r.estado === f) && `${r.folio} ${r.colonia} ${r.user}`.toLowerCase().includes(q));
  $("#tAll").innerHTML = rows(lista, true);
}
/* Entrar con ?estado=pendiente filtra automáticamente */
const filtroUrl = new URLSearchParams(location.search).get("estado");
if (filtroUrl && ESTADOS[filtroUrl]) $("#fEstado").value = filtroUrl;

$("#q").oninput = $("#fEstado").onchange = pintar;
document.addEventListener("click", e => {
  const b = e.target.closest("[data-det]"); if (!b) return;
  const f = b.dataset.det; abiertos.has(f) ? abiertos.delete(f) : abiertos.add(f);
  pintar();
});
document.addEventListener("reportes:cambio", pintar);
pintar();
