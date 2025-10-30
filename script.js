// ===============================================
// INICIO DE LA APLICACIÓN (EVENT LISTENERS)
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
            if (!response.ok) {
                // Si el archivo no se encuentra (Error 404), lanzamos un error
                throw new Error('No se pudo encontrar o cargar el archivo. Verifica la ruta y el nombre del archivo.');
            }
            return response.text();
        })
        .then(text => {
            // 3. Mostrar el contenido
            modalLoading.classList.add('hidden');
            modalContent.textContent = text;
        })
        .catch(error => {
            // 4. Manejar errores y mostrar mensaje
            modalLoading.classList.add('hidden');
            modalContent.textContent = `ERROR: ${error.message}`;
            console.error('Error de carga:', error);
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
    
    // Inicializar íconos de Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Lógica de menú móvil
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

// Hacer las funciones openModal y closeModal globales (necesario para onclick en HTML)
window.openModal = openModal;
window.closeModal = closeModal;
