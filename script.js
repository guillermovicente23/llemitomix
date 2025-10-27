// ===============================================
// INICIO DE LA APLICACIÓN (EVENT LISTENERS)
// Este script solo maneja la UI (menú e íconos).
// ===============================================
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
            // Muestra u oculta el menú móvil
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
