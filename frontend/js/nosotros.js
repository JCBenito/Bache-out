
// =========================================
// VERIFICAR SI EXISTE UNA SESIÓN
// =========================================

function tieneSesion() {

    return sessionStorage.getItem("sesionIniciada") === "true";

}


// =========================================
// PROTEGER LOS ENLACES DE LA BARRA
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // OCULTAR BOTONES SI EXISTE UNA SESIÓN
    // =========================================

    if (tieneSesion()) {

        document.querySelector(".btn-sesion")?.remove();

        document.querySelector(".btn-proposito")?.remove();

    }


    // =========================================
    // PROTEGER LOS ENLACES DE LA BARRA
    // =========================================

    const enlacesPrivados = document.querySelectorAll(
        'a[href="index.html"], ' +
        'a[href="Reporte.html"], ' +
        'a[href="Detalles.html"], ' +
        'a[href="Mapa.html"], ' +
        'a[href="Perfil.html"]'
    );


    enlacesPrivados.forEach(function (enlace) {

        enlace.addEventListener("click", function (evento) {

            if (!tieneSesion()) {

                evento.preventDefault();

                alert(
                    "Debes iniciar sesión para acceder a esta sección."
                );

                window.location.href = "login.html";

            }

        });

    });

});
