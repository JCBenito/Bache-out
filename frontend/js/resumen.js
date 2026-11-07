/* Bache-Out · Resumen */
const mini = baseMap("miniMap", 12);
const capa = L.layerGroup().addTo(mini);

function pintar() {
  $("#tRecent").innerHTML = rows([...reportes].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 6), false);
  ponerPines(capa, reportes);
  renderCharts();
}
pintar();
ajustarMapa(mini, reportes);
seguirUbicacion([mini], () => {});
document.addEventListener("reportes:cambio", pintar);
