/* Bache-Out · Login del administrador */

/* IMPORTANTE: esto es una demostración en el navegador. En producción valida
   el correo y la contraseña en tu servidor (fetch a tu API) y usa cookies de sesión seguras. */
const ADMINS = [{ correo: "admin@bache-out.mx", pass: "admin123" }];
const ACCESO_ABIERTO = true; /* true = entra cualquier correo y contraseña (solo para pruebas). Ponlo en false para exigir los correos de ADMINS. */
const PAGINA_INICIO = "resumen.html";

/* Sesión: usa sessionStorage y, si el navegador lo bloquea (pasa al abrir archivos con doble clic), window.name */
function leerSesion() {
  try { const s = sessionStorage.getItem("bo_sesion"); if (s) return s; } catch (e) {}
  const m = /(?:^|;)bo_sesion=([^;]*)/.exec(window.name || ""); return m ? decodeURIComponent(m[1]) : null;
}
function guardarSesion(c) { try { sessionStorage.setItem("bo_sesion", c); } catch (e) {} window.name = "bo_sesion=" + encodeURIComponent(c); }
function borrarSesion() { try { sessionStorage.removeItem("bo_sesion"); } catch (e) {} window.name = ""; }

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const emailOk = v => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v);
const passGuardada = c => { try { return localStorage.getItem("bo_pass_" + c); } catch (e) { return null; } };
const autenticar = (c, p) => {
  if (ACCESO_ABIERTO) return true;
  const a = ADMINS.find(x => x.correo === c);
  return !!a && p === (passGuardada(c) || a.pass);
};
const msg = (id, t, ok) => { const e = $(id); e.textContent = t; e.classList.toggle("ok", !!ok); };

function panel(id) {
  ["fLogin", "fRec1"].forEach(f => $("#" + f).hidden = f !== id);
  ["lMsg", "r1Msg"].forEach(m => msg("#" + m, ""));
  $({ fLogin: "#lCorreo", fRec1: "#rCorreo" }[id]).focus();
}

/* Si ya hay sesión, pasa directo al panel */
const sesion = leerSesion();
if (sesion) location.replace(PAGINA_INICIO);

$$("[data-ver]").forEach(b => b.onclick = () => {
  const i = $("#" + b.dataset.ver), ver = i.type === "password";
  i.type = ver ? "text" : "password"; b.textContent = ver ? "Ocultar" : "Mostrar";
});
$("#goRec").onclick = () => { $("#rCorreo").value = $("#lCorreo").value.trim(); panel("fRec1"); };
$$("[data-back]").forEach(b => b.onclick = () => panel("fLogin"));

$("#fLogin").onsubmit = e => {
  e.preventDefault();
  const c = $("#lCorreo").value.trim().toLowerCase(), p = $("#lPass").value;
  $("#lCorreo").removeAttribute("aria-invalid");
  if (!emailOk(c)) { $("#lCorreo").setAttribute("aria-invalid", "true"); msg("#lMsg", "Escribe tu correo, por ejemplo nombre@dominio.mx."); return; }
  if (!p) { msg("#lMsg", "Escribe tu contraseña."); return; }
  if (autenticar(c, p)) {
    guardarSesion(c);
    location.href = PAGINA_INICIO;
  } else {
    msg("#lMsg", "Correo o contraseña incorrectos. Revisa que estén bien escritos."); $("#lPass").select();
  }
};

/* Cambiar contraseña (sin código) */
$("#fRec1").onsubmit = e => {
  e.preventDefault();
  const c = $("#rCorreo").value.trim().toLowerCase(), n = $("#rNueva").value, c2 = $("#rConf").value;
  if (!emailOk(c)) { msg("#r1Msg", "Escribe tu correo, por ejemplo nombre@dominio.mx."); return; }
  if (!ACCESO_ABIERTO && !ADMINS.some(a => a.correo === c)) { msg("#r1Msg", "Ese correo no tiene acceso de administrador."); return; }
  if (n.length < 4) { msg("#r1Msg", "La contraseña debe tener al menos 4 caracteres."); return; }
  if (n !== c2) { msg("#r1Msg", "Las contraseñas no coinciden."); return; }
  try { localStorage.setItem("bo_pass_" + c, n); } catch (e) {} /* aquí tu servidor guarda la nueva contraseña */
  $("#lCorreo").value = c; $("#lPass").value = ""; ["rNueva", "rConf"].forEach(i => $("#" + i).value = "");
  panel("fLogin"); msg("#lMsg", "Contraseña cambiada. Ya puedes iniciar sesión.", true); $("#lPass").focus();
};

if (new URLSearchParams(location.search).get("salio")) msg("#lMsg", "Cerraste sesión correctamente.", true);
$("#lCorreo").focus();
