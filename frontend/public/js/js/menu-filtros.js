document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Capturamos todos los botones y todas las tarjetas
    const botonesFiltro = document.querySelectorAll(".btn-filtro");
    const tarjetasProducto = document.querySelectorAll(".menu-card");

    // 2. Agregamos el evento clic a cada botón
    botonesFiltro.forEach(boton => {
        boton.addEventListener("click", function() {
            
            // Quitar la clase 'active' de todos los botones
            botonesFiltro.forEach(btn => btn.classList.remove("active"));
            
            // Poner la clase 'active' al botón que hicimos clic
            this.classList.add("active");

            // Saber qué categoría seleccionó el usuario
            const categoriaSeleccionada = this.getAttribute("data-filter");

            // 3. Filtrar las tarjetas
            tarjetasProducto.forEach(tarjeta => {
                const categoriaTarjeta = tarjeta.getAttribute("data-categoria");

                if (categoriaSeleccionada === "Todos" || categoriaSeleccionada === categoriaTarjeta) {
                    tarjeta.style.display = "flex"; // Lo mostramos
                } else {
                    tarjeta.style.display = "none"; // Lo ocultamos
                }
            });
        });
    });
});