// ===============================================
// INICIO DE LA APLICACIÓN (EVENT LISTENERS)
// Este script maneja la UI (menú e íconos) y el modal de vista previa.
// ===============================================

// Referencias a los elementos del modal
const modal = document.getElementById('preview-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const modalDownloadLink = document.getElementById('modal-download-link');
const modalLoading = document.getElementById('modal-loading');

/**
 * Función para abrir el modal y cargar el contenido del archivo TXT.
 * @param {string} filePath La ruta relativa del archivo TXT (ej: 'codigos/archivo.txt').
 */
function openModal(filePath) {
    // 1. Mostrar la estructura del modal
    modal.classList.remove('hidden');
    modalContent.textContent = ''; // Limpiar contenido anterior
    modalLoading.classList.remove('hidden');
    
    // Extraer el nombre del archivo para el título
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
    modalTitle.textContent = `Vista Previa: ${fileName}`;
    modalDownloadLink.href = filePath; // Configurar el enlace de descarga

    // 2. Cargar el contenido del archivo TXT usando fetch
    fetch(filePath)
        .then(response => {
            modalLoading.classList.add('hidden'); // Ocultar el spinner de carga
            
            if (!response.ok) {
                // Capturar el error 404 o cualquier otro error de HTTP
                const status = response.status;
                const statusText = response.statusText;
                
                // Mostrar un mensaje claro en la vista previa
                modalContent.textContent = 
                    `*** ERROR AL CARGAR EL ARCHIVO (Código ${status}: ${statusText}) ***\n\n` +
                    `No se pudo encontrar el documento en la ruta:\n` +
                    `'${filePath}'\n\n` +
                    `VERIFICA que el archivo '${fileName}' exista y esté dentro de la carpeta 'codigos'`;
                
                throw new Error('Error de carga de archivo.');
            }
            return response.text();
        })
        .then(text => {
            // 3. Mostrar el contenido
            modalContent.textContent = text;
        })
        .catch(error => {
            // Este catch solo se ejecuta para errores de red o el error forzado arriba.
            console.error('Error durante la solicitud:', error);
            // El mensaje de error ya se mostró en el paso anterior si fue un 404.
        });
}

/**
 * Función para cerrar el modal.
 */
function closeModal() {
    modal.classList.add('hidden');
}


// Event listeners de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Inicializar íconos de Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // 2. Lógica de menú móvil
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });

        // Cierra el menú móvil al hacer clic en un enlace de navegación
        document.querySelectorAll('#mobile-menu a').forEach(item => {
            item.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
});

// Hacer las funciones openModal y closeModal globales
window.openModal = openModal;
window.closeModal = closeModal;
