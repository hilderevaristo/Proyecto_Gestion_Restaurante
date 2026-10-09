// ========== VARIABLES GLOBALES ==========
let estadoFiltroActual = 'todos';
let pedidoIdActual = null;

// ========== CONFIGURACIÓN DE ESTADOS ==========
const ESTADOS_CONFIG = {
    'pendiente': { texto: 'PENDIENTE', color: '#FFA500' },
    'procesando': { texto: 'procesando', color: '#FFD700' },
    'enviado': { texto: 'enviado', color: '#1E90FF' },
    'completado': { texto: 'completado', color: '#28A745' },
    'cancelado': { texto: 'cancelado', color: '#DC3545' }
};

// ========== OBTENER COLOR DEL ESTADO ==========
function getColorEstado(estado) {
    const key = estado?.toLowerCase() || '';
    return ESTADOS_CONFIG[key]?.color || '#6C757D';
}

// ========== OBTENER TEXTO DEL ESTADO ==========
function getTextoEstado(estado) {
    const key = estado?.toLowerCase() || '';
    return ESTADOS_CONFIG[key]?.texto || estado?.toUpperCase() || 'DESCONOCIDO';
}

// ========== OBTENER ESTADO DE UNA FILA ==========
function obtenerEstadoDeFila(row) {
    const celdas = row.getElementsByTagName('td');
    if (celdas.length < 8) return '';
    
    // Obtener el texto de la celda 7 (columna Estado)
    const estadoCelda = celdas[7];
    if (!estadoCelda) return '';
    
    // Obtener el texto limpio (sin HTML)
    const textoCompleto = estadoCelda.textContent?.toLowerCase()?.trim() || '';
    
    console.log("🔍 Texto de estado encontrado:", textoCompleto);
    
    // Buscar cualquiera de los estados conocidos
    const estados = ['pendiente', 'procesando', 'enviado', 'completado', 'cancelado'];
    for (const estado of estados) {
        if (textoCompleto.includes(estado)) {
            console.log("✅ Estado detectado:", estado);
            return estado;
        }
    }
    
    return textoCompleto;
}

// ========== FILTRAR POR ESTADO ==========
function filtrarPorEstado(estado, boton) {
    console.log("🔍 Filtrando por:", estado);
    
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('active'));
    if (boton) boton.classList.add('active');
    
    estadoFiltroActual = estado.toLowerCase();
    console.log("📌 estadoFiltroActual:", estadoFiltroActual);
    
    const table = document.getElementById('tablaPedidos');
    if (!table) {
        console.error("❌ Tabla no encontrada");
        return;
    }
    
    const rows = table.getElementsByTagName('tr');
    let encontrados = 0;
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        // Saltar filas de detalle
        if (row.querySelector('td[colspan]')) continue;
        
        // Obtener el estado de la fila
        const estadoCelda = obtenerEstadoDeFila(row);
        console.log(`Fila ${i}: estadoCelda = "${estadoCelda}"`);
        
        if (estado === 'todos') {
            row.style.display = '';
            encontrados++;
        } else {
            const estadoFiltro = estado.toLowerCase();
            if (estadoCelda.includes(estadoFiltro)) {
                row.style.display = '';
                encontrados++;
                console.log(`✅ Fila ${i} coincide con "${estadoFiltro}"`);
            } else {
                row.style.display = 'none';
                console.log(`❌ Fila ${i} NO coincide (${estadoCelda} vs ${estadoFiltro})`);
            }
        }
    }
    
    console.log(`✅ Mostrados: ${encontrados} pedidos`);
}

// ========== FILTRAR POR BÚSQUEDA ==========
function filtrarPedidos() {
    aplicarFiltros();
}

// ========== APLICAR FILTROS ==========
function aplicarFiltros() {
    const input = document.getElementById('buscadorPedidos');
    const filter = input ? input.value.toUpperCase().trim() : '';
    const table = document.getElementById('tablaPedidos');
    if (!table) return;
    
    const rows = table.getElementsByTagName('tr');
    let encontrados = 0;

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        // Manejar filas de detalle
        if (row.querySelector('td[colspan]')) {
            const prevRow = rows[i - 1];
            if (prevRow && prevRow.style.display !== 'none') {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
            continue;
        }
        
        const celdas = row.getElementsByTagName('td');
        const cliente = celdas[1]?.textContent?.toUpperCase() || '';
        const telefono = celdas[2]?.textContent?.toUpperCase() || '';
        const direccion = celdas[3]?.textContent?.toUpperCase() || '';
        
        // Obtener estado usando la función auxiliar
        const estadoCelda = obtenerEstadoDeFila(row);

        const coincideBusqueda = filter === '' || 
            cliente.includes(filter) || 
            telefono.includes(filter) || 
            direccion.includes(filter);
        
        const coincideEstado = estadoFiltroActual === 'todos' || 
            estadoCelda.includes(estadoFiltroActual);

        if (coincideBusqueda && coincideEstado) {
            row.style.display = '';
            encontrados++;
        } else {
            row.style.display = 'none';
        }
    }

    // Mostrar mensaje de no resultados
    let mensajeNoResultados = document.getElementById('mensajeNoResultados');
    if (filter.length > 0 && encontrados === 0) {
        if (!mensajeNoResultados) {
            mensajeNoResultados = document.createElement('tr');
            mensajeNoResultados.id = 'mensajeNoResultados';
            mensajeNoResultados.innerHTML = `
                <td colspan="10" class="text-center py-4" style="background-color: #f8f9fa;">
                    <i class="fas fa-search fa-2x text-muted mb-2" style="display: block;"></i>
                    <p class="text-muted mb-0">
                        <strong>🔍 No se encontraron pedidos para "<span id="textoBuscado">${input.value}</span>"</strong>
                    </p>
                </td>
            `;
            table.appendChild(mensajeNoResultados);
        } else {
            mensajeNoResultados.style.display = '';
            const textoBuscado = document.getElementById('textoBuscado');
            if (textoBuscado) textoBuscado.textContent = input.value;
        }
    } else {
        if (mensajeNoResultados) mensajeNoResultados.style.display = 'none';
    }
}

// ========== ABRIR MODAL DE ESTADO ==========
function abrirModalEstado(boton) {
    console.log("🖊️ Abriendo modal de estado");
    
    pedidoIdActual = boton.getAttribute('data-id');
    const estadoActual = boton.getAttribute('data-estado')?.toLowerCase() || '';
    
    console.log("📦 ID:", pedidoIdActual, "Estado actual:", estadoActual);
    
    const container = document.getElementById('botonesEstados');
    if (!container) {
        console.error("❌ Contenedor 'botonesEstados' no encontrado");
        alert('Error: No se encontró el contenedor de estados');
        return;
    }
    container.innerHTML = '';
    
    const estados = [
        { valor: 'pendiente', texto: 'Pendiente', color: '#FFA500' },
        { valor: 'procesando', texto: 'procesando', color: '#FFD700' },
        { valor: 'enviado', texto: 'enviado', color: '#1E90FF' },
        { valor: 'completado', texto: 'Completado', color: '#28A745' },
        { valor: 'cancelado', texto: 'Cancelado', color: '#DC3545' }
    ];
    
    estados.forEach(estado => {
        const esActivo = estado.valor === estadoActual;
        const btn = document.createElement('button');
        btn.className = `btn-estado-modal ${esActivo ? 'activo' : ''}`;
        btn.setAttribute('data-valor', estado.valor);
        btn.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 12px 16px;
            border: 2px solid ${esActivo ? '#28a745' : '#e9ecef'};
            border-radius: 8px;
            background: ${esActivo ? '#f0fff4' : 'white'};
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 8px;
            font-size: 14px;
        `;
        btn.innerHTML = `
            <span>
                <span style="display:inline-block; width:16px; height:16px; border-radius:50%; background-color:${estado.color}; margin-right:12px;"></span>
                <span>${estado.texto}</span>
            </span>
            <span style="color:#28a745; font-weight:bold; font-size:18px;">${esActivo ? '✓' : ''}</span>
        `;
        btn.onclick = function() { seleccionarEstado(this); };
        container.appendChild(btn);
    });
    
    const modalElement = document.getElementById('modalCambiarEstado');
    if (!modalElement) {
        console.error("❌ Modal 'modalCambiarEstado' no encontrado");
        alert('Error: No se encontró el modal');
        return;
    }
    
    modalElement.style.display = 'flex';
    console.log("✅ Modal abierto");
}

// ========== CERRAR MODAL ==========
function cerrarModalEstado() {
    const modal = document.getElementById('modalCambiarEstado');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ========== SELECCIONAR ESTADO ==========
function seleccionarEstado(boton) {
    const nuevoEstado = boton.getAttribute('data-valor');
    const nuevoEstadoMinuscula = nuevoEstado.toLowerCase();
    
    console.log("📦 Estado seleccionado:", nuevoEstadoMinuscula);
    
    cerrarModalEstado();
    
    const formData = new URLSearchParams();
    formData.append('id', pedidoIdActual);
    formData.append('estado', nuevoEstadoMinuscula);
    
    console.log("📤 Enviando:", formData.toString());
    
    const url = '/admin/pedido-cambiar-estado';
    
    Swal.fire({
        title: '⏳ Actualizando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        Swal.close();
        if (data.success) {
            Swal.fire({
                title: 'Exito',
                text: 'Estado actualizado correctamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                location.reload();
            });
        } else {
            Swal.fire({
                title: '❌ Error',
                text: data.message || 'Error al cambiar el estado',
                icon: 'error'
            });
        }
    })
    .catch((error) => {
        Swal.close();
        Swal.fire({
            title: '❌ Error',
            text: `Error: ${error.message}`,
            icon: 'error'
        });
    });
}

// ========== CAMBIAR ICONO DEL DETALLE ==========
function cambiarIcono(element, id) {
    const icon = document.getElementById('icono-' + id);
    if (icon) {
        if (icon.classList.contains('fa-chevron-down')) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        } else {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    }
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Inicializando pedidos.js");
    
    document.querySelectorAll('.btn-editar-estado').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            abrirModalEstado(this);
        });
    });
    
    const buscador = document.getElementById('buscadorPedidos');
    if (buscador) {
        buscador.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                aplicarFiltros();
            }
        });
    }
    
    const modal = document.getElementById('modalCambiarEstado');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModalEstado();
            }
        });
    }
    
    console.log("Inicialización completada");
});

// ========== CERRAR CON ESC ==========
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cerrarModalEstado();
    }
});

// ========== ELIMINAR ORDEN ==========
function eliminarOrden(id, cliente) {
    console.log("🗑️ Eliminando orden - ID:", id, "Cliente:", cliente);
    
    // Verificar que los datos lleguen bien
    if (!id || id === 'undefined' || id === 'null') {
        Swal.fire({
            title: '❌ Error',
            text: 'ID de pedido no válido',
            icon: 'error'
        });
        return;
    }
    
    Swal.fire({
        title: '⚠️ ¿Eliminar orden?',
        html: `
            <p>Estás a punto de eliminar la orden de <strong>${cliente || 'cliente desconocido'}</strong>.</p>
            <p style="color: #dc3545; font-weight: bold;">¡Esta acción no se puede deshacer!</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: '⏳ Eliminando...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            const formData = new URLSearchParams();
            formData.append('id', id);
            
            console.log("📤 Enviando petición a /admin/pedido-eliminar con ID:", id);
            
            fetch('/admin/pedido-eliminar', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            })
            .then(response => {
                console.log("📥 Status HTTP:", response.status);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("📥 Respuesta del backend:", data);
                Swal.close();
                if (data.success) {
                    Swal.fire({
                        title: '✅ Eliminado',
                        text: 'La orden ha sido eliminada correctamente',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        title: '❌ Error',
                        text: data.message || 'Error al eliminar la orden',
                        icon: 'error',
                        confirmButtonColor: '#dc3545'
                    });
                }
            })
            .catch((error) => {
                console.error("❌ Error en fetch:", error);
                Swal.close();
                Swal.fire({
                    title: '❌ Error de conexión',
                    text: `Error: ${error.message}`,
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
            });
        }
    });
}


// ========== INICIALIZAR BOTONES CON EVENT LISTENER ==========
function inicializarBotonesEliminar() {
    document.querySelectorAll('.btn-eliminar-orden').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            const cliente = this.getAttribute('data-cliente');
            console.log("🖱️ Click en eliminar - ID:", id, "Cliente:", cliente);
            eliminarOrden(id, cliente);
        });
    });
}

// ========== AGREGAR A DOMContentLoaded ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Inicializando pedidos.js");
    
    // Botones de editar estado
    document.querySelectorAll('.btn-editar-estado').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            abrirModalEstado(this);
        });
    });
    
    // ✅ BOTONES DE ELIMINAR
    inicializarBotonesEliminar();
    
    // Buscador
    const buscador = document.getElementById('buscadorPedidos');
    if (buscador) {
        buscador.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                aplicarFiltros();
            }
        });
    }
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('modalCambiarEstado');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModalEstado();
            }
        });
    }
    
    console.log("✅ Inicialización completada");
});