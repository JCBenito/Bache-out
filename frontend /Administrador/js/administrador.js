/* Bache-Out · Perfil del administrador */
const P = { nombre: "#pNombre", correo: "#pCorreo", tel: "#pTel", cargo: "#pCargo" };

function pintarPerfil() {
  Object.entries(P).forEach(([k, id]) => $(id).value = perfil[k]);
  $("#pTitulo").textContent = perfil.nombre; $("#pSub").textContent = perfil.cargo;
  $("#pAv").textContent = $("#hAv").textContent = iniciales(perfil.nombre);
  $("#hName").textContent = perfil.nombre.split(" ")[0];
}
function editando(on) {
  Object.values(P).forEach(id => $(id).disabled = !on);
  $("#pEditar").hidden = on; $("#pGuardar").hidden = !on; $("#pCancelar").hidden = !on;
  $$("[data-err]").forEach(e => e.textContent = "");
  if (on) $(P.nombre).focus();
}
function validar() {
  const e = {}, v = k => $(P[k]).value.trim();
  if (v("nombre").length < 3) e.nombre = "Escribe tu nombre completo.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("correo"))) e.correo = "Escribe un correo válido, como nombre@dominio.mx.";
  if (v("tel") && v("tel").replace(/\D/g, "").length < 10) e.tel = "El teléfono debe tener al menos 10 dígitos.";
  $$("[data-err]").forEach(el => el.textContent = e[el.dataset.err] || "");
  return !Object.keys(e).length;
}
$("#pEditar").onclick = () => editando(true);
$("#pCancelar").onclick = () => { pintarPerfil(); editando(false); };
$("#pGuardar").onclick = () => {
  if (!validar()) return;
  Object.entries(P).forEach(([k, id]) => perfil[k] = $(id).value.trim());
  try { localStorage.setItem("bo_admin", JSON.stringify(perfil)); } catch (e) {} /* aquí harías fetch/PUT a tu servidor */
  pintarPerfil(); editando(false); toast("Perfil actualizado");
};

/* Cerrar sesión */
$("#pSalir").onclick = () => $("#dSalir").showModal();
$("#sNo").onclick = () => $("#dSalir").close();
$("#sSi").onclick = () => {
  borrarSesion();
  location.href = RUTAS.login + "?salio=1";
};
pintarPerfil();
