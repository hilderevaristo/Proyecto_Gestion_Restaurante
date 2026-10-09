// Efecto scroll navbar: transparente → blanco con animación
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('mainNav');
    
    window.addEventListener('scroll', function() {
        // Si el scroll es mayor a 50px
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});