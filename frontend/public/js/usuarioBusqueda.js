function filtrarUsuarios() {
    const input = document.getElementById('buscadorUsuarios');
    if (!input) return;

    const filter = input.value.toUpperCase().trim();
    const table = document.getElementById('tablaUsuarios');
    if (!table) return;

    const rows = table.getElementsByTagName('tr');
    let encontrados = 0;

    // Recorrer desde 1 para saltar el encabezado
    for (let i = 1; i < rows.length; i++) {
        const nombre = rows[i].getElementsByTagName('td')[1]?.textContent?.toUpperCase() || '';
        const email = rows[i].getElementsByTagName('td')[2]?.textContent?.toUpperCase() || '';

        if (nombre.indexOf(filter) > -1 || email.indexOf(filter) > -1) {
            rows[i].style.display = '';
            encontrados++;
        } else {
            rows[i].style.display = 'none';
        }
    }

    // Mostrar mensaje si no hay resultados
    let mensajeNoResultados = document.getElementById('mensajeNoResultados');

    if (filter.length > 0 && encontrados === 0) {
        if (!mensajeNoResultados) {
            mensajeNoResultados = document.createElement('tr');
            mensajeNoResultados.id = 'mensajeNoResultados';
            mensajeNoResultados.innerHTML = `
                    <td colspan="6" class="text-center py-4">
                        <i class="fas fa-search fa-2x text-muted mb-2"></i>
                        <p class="text-muted mb-0">No se encontraron usuarios para "<strong>${input.value}</strong>"</p>
                    </td>
                `;
            table.appendChild(mensajeNoResultados);
        } else {
            mensajeNoResultados.style.display = '';
            mensajeNoResultados.querySelector('strong').textContent = input.value;
        }
    } else {
        if (mensajeNoResultados) {
            mensajeNoResultados.style.display = 'none';
        }
    }
}

// ✅ FUNCIÓN CON SWEETALERT2


function confirmarEliminar(boton) {
    const id = boton.getAttribute('data-id');
    const nombre = boton.getAttribute('data-nombre');

    Swal.fire({
        title: '¿Estás seguro?',
        html: `El usuario <strong>"${nombre}"</strong> será eliminado permanentemente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/admin/eliminarUsuario';

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'id';
            input.value = id;

            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        }
    });
}