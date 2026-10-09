document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Validación de cambio de contraseña
    const formPassword = document.getElementById('formPassword');
    const nuevaPassword = document.getElementById('nuevaPassword');
    const confirmarPassword = document.getElementById('confirmarPassword');
    const errorPassword = document.getElementById('errorPassword');

    if(formPassword) {
        formPassword.addEventListener('submit', function(e) {
            if (nuevaPassword.value !== confirmarPassword.value) {
                e.preventDefault(); // Detiene el envío del formulario
                errorPassword.style.display = 'block';
                confirmarPassword.classList.add('is-invalid');
            } else {
                errorPassword.style.display = 'none';
                confirmarPassword.classList.remove('is-invalid');
            }
        });
    }
});

// 2. Alerta SweetAlert para eliminar dirección
function confirmarEliminarDireccion(boton) {
    const id = boton.getAttribute('data-id');

    Swal.fire({
        title: '¿Eliminar dirección?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Creamos un formulario dinámico para enviarlo por POST
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/perfil/eliminar-direccion/' + id;
            document.body.appendChild(form);
            form.submit();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const alertas = document.querySelectorAll('.alert');
    
    alertas.forEach(alerta => {
        // Esperamos 4 segundos exactos (lo que dura la barra CSS)
        setTimeout(function() {
            alerta.classList.add('fade-out-toast'); // Le agregamos la clase que lo desvanece
            
            // Esperamos medio segundo a que termine la animación y lo borramos del DOM
            setTimeout(function() {
                alerta.remove();
            }, 500); 
        }, 4000); 
    });
});