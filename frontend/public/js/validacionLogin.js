// JavaScript para animación y mensajes del botón Ingresar
document.addEventListener('DOMContentLoaded', function() {

    const formLogin = document.getElementById('formLogin');
    const btnIngresar = document.getElementById('btnIngresar');
    const btnTexto = document.getElementById('btnTexto');
    const btnSpinner = document.getElementById('btnSpinner');

    if (formLogin) {
        formLogin.addEventListener('submit', function(event) {
            event.preventDefault(); // ✅ Evita que la página se recargue

            const email = document.querySelector('input[name="email"]').value;
            const password = document.querySelector('input[name="password"]').value;

            // ✅ Validar campos vacíos
            if (!email || !password) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos incompletos',
                    text: 'Por favor completa todos los campos',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Entendido'
                });
                return false;
            }

            // ✅ Activar animación en el botón
            btnIngresar.classList.add('cargando');
            btnTexto.innerHTML = 'Ingresando';
            btnSpinner.style.display = 'inline-block';

            // Puntos suspensivos animados
            let puntos = 0;
            const intervalo = setInterval(() => {
                puntos = (puntos + 1) % 4;
                btnTexto.innerHTML = `Ingresando${'.'.repeat(puntos)}`;
            }, 500);

            // ✅ Enviar datos con fetch (sin recargar)
            const formData = new URLSearchParams();
            formData.append('email', email);
            formData.append('password', password);

            fetch('/procesarLogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Detener animación
                clearInterval(intervalo);
                btnIngresar.classList.remove('cargando');
                btnTexto.innerHTML = 'Ingresar';
                btnSpinner.style.display = 'none';

                if (data.success) {
                    // ✅ Login exitoso - Mostrar bienvenida
                    Swal.fire({
                        icon: 'success',
                        title: `¡Bienvenido, ${data.nombre}!`,
                        text: 'Inicio de sesión exitoso',
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false
                    }).then(() => {
                        // Redirigir según el rol
                        if (data.rol === 'ADMIN') {
                            window.location.href = '/admin/dashboard';
                        } else {
                            window.location.href = '/';
                        }
                    });
                } else {
                    // ✅ Login fallido - Mostrar error
                    let mensaje = '❌ Correo o contraseña incorrectos';
                    if (data.errorMsg === 'usuario_no_existe') {
                        mensaje = '❌ El correo no está registrado';
                    } else if (data.errorMsg === 'contrasena_incorrecta') {
                        mensaje = '❌ Contraseña incorrecta';
                    }

                    Swal.fire({
                        icon: 'error',
                        title: 'Error de inicio de sesión',
                        text: mensaje,
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'Intentar de nuevo',
                        timer: 4000,
                        timerProgressBar: true
                    });
                }
            })
            .catch(error => {
                clearInterval(intervalo);
                btnIngresar.classList.remove('cargando');
                btnTexto.innerHTML = 'Ingresar';
                btnSpinner.style.display = 'none';

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al iniciar sesión',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Entendido'
                });
                console.error('Error:', error);
            });

            return false;
        });
    }

    // Botón "¿Olvidaste tu contraseña?"
    const btnOlvidePass = document.getElementById('btnOlvidePass');
    if (btnOlvidePass) {
        btnOlvidePass.addEventListener('click', function(e) {
            e.preventDefault();
            Swal.fire({
                icon: 'info',
                title: 'Recuperar contraseña',
                text: '📧 Envía un correo a soporte@donvictor.com para recuperar tu contraseña',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Entendido'
            });
        });
    }
});