document.addEventListener('DOMContentLoaded', function() {
    
    const alertaExito = document.getElementById('mensajeExito');

    if (alertaExito) {
        
        // Limpiamos la URL (quitamos el ?exito=true) de inmediato
        window.history.replaceState(null, null, window.location.pathname);

        // Esperamos exactamente 4 segundos (lo que dura la barra de CSS en llegar a 0)
        setTimeout(function() {
            
            // Le agregamos la clase que lo desvanece hacia arriba
            alertaExito.classList.add('fade-out-toast');

            // Esperamos medio segundo a que termine de subir, y lo borramos del HTML
            setTimeout(function() {
                alertaExito.remove();
            }, 500); 

        }, 4000); 
    }
});