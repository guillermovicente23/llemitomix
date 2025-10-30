// ===============================================
// LÓGICA PRINCIPAL DEL PORTAFOLIO
// (Solo incluye inicialización de íconos y menú móvil)
// ===============================================

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
