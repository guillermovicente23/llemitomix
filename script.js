// ===============================================
// LÓGICA PRINCIPAL DEL PORTAFOLIO Y MODAL
// ===============================================

// Referencias a los elementos del modal (deben coincidir con los IDs en index.html)
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
    // 1. Configuración inicial del modal y estado de carga
    modal.classList.remove('hidden');
    modalContent.textContent = ''; 
    modalLoading.classList.remove('hidden');
    
    // Extraer el nombre del archivo para el título y configurar el enlace de descarga
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
    modalTitle.textContent = `Vista Previa: ${fileName}`;
    modalDownloadLink.href = filePath; 

    // 2. Usar la API Fetch para cargar el contenido del archivo de texto
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                // Si el archivo no se encuentra (Error 404) o hay otro problema de red
                throw new Error(`No se pudo encontrar el archivo (${response.status}).`);
            }
            return response.text();
        })
        .then(text => {
            // 3. Mostrar el contenido cargado
            modalLoading.classList.add('hidden');
            modalContent.textContent = text;
        })
        .catch(error => {
            // 4. Manejar y mostrar el error de carga
            modalLoading.classList.add('hidden');
            modalContent.textContent = `
ERROR AL CARGAR EL DOCUMENTO.
Razón: ${error.message}

Asegúrate de:
1. La carpeta se llama EXACTAMENTE 'codigos'.
2. Los 3 archivos tienen extensión '.txt' y el nombre correcto.
`;
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

// Exportar las funciones para que sean accesibles desde el HTML (onclick)
window.openModal = openModal;
window.closeModal = closeModal;
