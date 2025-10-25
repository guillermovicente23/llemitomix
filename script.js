// ===============================================
// CONSTANTES Y UTILIDADES
// ===============================================

const LOCAL_STORAGE_KEY = 'guillermo_proyectos_data';

/**
 * Muestra un mensaje temporal (toast) en la esquina inferior derecha.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} bgColor - Clase de color de fondo de Tailwind (ej. 'bg-green-500').
 */
function showTemporaryMessage(message, bgColor) {
    const toast = document.getElementById('toast-message');
    if (!toast) return;

    toast.textContent = message;
    // Mostrar el toast
    toast.className = `fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white ${bgColor} transition-transform transform translate-y-0`;

    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.className = 'fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white transition-transform transform translate-y-20';
    }, 3000);
}

// ===============================================
// GESTIÓN DE LOCALSTORAGE
// ===============================================

// NOTA: Se ha modificado para guardar la URL temporal (blob)
// Esta URL es solo válida en la sesión actual.

/** Obtiene la lista de proyectos desde localStorage. */
function getProjects() {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        // Si hay datos, restaurar las URL temporales con un marcador
        // En este caso, simplemente devolvemos lo guardado, la URL temporal
        // se recrea al subir el archivo (ver handleUploadSubmit)
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error al leer localStorage:", e);
        return [];
    }
}

/** Guarda la lista de proyectos en localStorage (limitando a 8). */
function saveProjects(projects) {
    try {
        // Guarda solo los primeros 8 elementos
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects.slice(0, 8)));
    } catch (e) {
        console.error("Error al escribir en localStorage:", e);
        showTemporaryMessage('Error: No se pudo guardar la información. Espacio de almacenamiento lleno.', 'bg-red-500');
    }
}

// ===============================================
// LÓGICA DE RENDERIZADO Y UI
// ===============================================

/** Carga los proyectos y llama a la función de renderizado. */
function loadProjects() {
    const projects = getProjects();
    renderProjects(projects);
}

/** * Dibuja las tarjetas de proyectos en el contenedor.
 * @param {Array<Object>} projects - Lista de metadatos de proyectos.
 */
function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    container.innerHTML = '';

    if (projects.length === 0) {
        container.innerHTML = `
             <div class="col-span-full text-center p-8 bg-dark-bg rounded-xl">
                 <p class="text-gray-400">Aún no has registrado ningún proyecto. Usa el botón "Subir/Registrar Proyectos" para comenzar.</p>
             </div>
           `;
    } else {
        projects.forEach(project => {
            const dateValue = project.uploadDate ? new Date(project.uploadDate).toLocaleDateString('es-ES') : 'Fecha Desconocida';
            const size = (project.size / 1024).toFixed(2); // KB
            const isMissing = !project.fileURL; // Comprobar si la URL temporal se perdió (al recargar)

            const card = `
                <div class="bg-dark-card rounded-xl p-6 shadow-2xl hover:shadow-primary-blue/30 transition-shadow duration-300 flex flex-col justify-between ${isMissing ? 'opacity-70 border border-red-500/50' : ''}">
                    <div>
                        <div class="bg-gray-700 h-10 w-10 rounded-full mb-4 flex items-center justify-center">
                            <i data-lucide="file-text" class="w-6 h-6 text-primary-blue"></i>
                        </div>
                        <h3 class="text-2xl font-semibold mb-2 ${isMissing ? 'text-red-400' : 'text-primary-blue'} line-clamp-2" title="${project.name}">
                            ${project.name} ${isMissing ? ' (PERDIDO)' : ''}
                        </h3>
                        <p class="text-gray-400 text-sm mb-2">
                            Tipo: ${project.type || 'Archivo'}
                        </p>
                        <p class="text-gray-500 text-xs mb-4">
                            Registrado: ${dateValue} | Tamaño: ${size} KB
                        </p>
                    </div>
                    <button 
                        data-project-id="${project.id}" 
                        data-file-name="${project.name}" 
                        data-file-size="${size} KB"
                        data-file-type="${project.type}"
                        data-file-url="${project.fileURL || ''}"
                        class="view-project-btn mt-4 w-full px-4 py-2 text-sm font-bold text-white rounded-full ${isMissing ? 'bg-red-500 cursor-not-allowed' : 'btn-primary'}"
                        ${isMissing ? 'disabled' : ''}
                    >
                        ${isMissing ? 'Archivo Perdido (Recarga)' : 'Ver / Abrir'}
                    </button>
                </div>
            `;
            container.innerHTML += card;
        });

        // Asegurarse de que los iconos y eventos se apliquen después de inyectar el HTML
        if (window.lucide) {
             window.lucide.createIcons();
        }
        
        document.querySelectorAll('.view-project-btn').forEach(button => {
            button.addEventListener('click', function() {
                // Solo abrir si hay una URL válida (solo pasa si no recargaste)
                if (this.dataset.fileUrl) {
                    openModal(
                        this.dataset.fileName, 
                        this.dataset.fileSize, 
                        this.dataset.fileType,
                        this.dataset.fileUrl
                    );
                } else {
                    showTemporaryMessage('El archivo físico se ha perdido al recargar la página. Sube el archivo de nuevo.', 'bg-red-500');
                }
            });
        });
    }
}

// ===============================================
// LÓGICA DE MODAL (SUBIDA)
// ===============================================

function openUploadModal() {
    document.getElementById('upload-modal').classList.remove('hidden');
}

function closeUploadModal() {
    document.getElementById('upload-modal').classList.add('hidden');
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
}

/** Maneja el envío del formulario de subida y registra los metadatos. */
function handleUploadSubmit(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const files = fileInput.files;

    if (files.length === 0) {
        showTemporaryMessage('Por favor, selecciona al menos un archivo.', 'bg-yellow-500');
        return;
    }

    uploadButton.disabled = true;
    uploadButton.innerHTML = 'Registrando...';

    try {
        let existingProjects = getProjects();
        const filesToRegister = Array.from(files);

        // Limpiar URL's temporales previas
        existingProjects.filter(p => p.fileURL).forEach(p => URL.revokeObjectURL(p.fileURL));

        for (let i = 0; i < filesToRegister.length; i++) {
            if (existingProjects.length >= 8) {
                showTemporaryMessage('Límite de 8 proyectos alcanzado. Guardando solo los primeros 8.', 'bg-yellow-500');
                break;
            }

            const file = filesToRegister[i];
            
            // Crea una URL temporal para el archivo Blob
            const tempURL = URL.createObjectURL(file); 

            const projectData = {
                id: Date.now() + i, 
                name: file.name,
                size: file.size, 
                type: file.type || 'Desconocido',
                uploadDate: Date.now(),
                fileURL: tempURL // ALMACENA LA URL TEMPORAL DEL NAVEGADOR
            };

            existingProjects.push(projectData);
        }
        
        saveProjects(existingProjects); 
        
        showTemporaryMessage('¡Proyectos registrados y listos para ver (temporalmente)!', 'bg-green-500');
        closeUploadModal();
        loadProjects(); 

    } catch (error) {
        console.error("Error al registrar proyectos:", error);
        showTemporaryMessage(`Error al registrar: ${error.message}`, 'bg-red-500');
    } finally {
        uploadButton.disabled = false;
        uploadButton.innerHTML = 'Confirmar Registro';
        if (fileInput) fileInput.value = '';
    }
}

// ===============================================
// LÓGICA DE MODAL (VISOR)
// ===============================================

function openModal(name, size, type, fileURL) {
    const modal = document.getElementById('view-modal');
    if (!modal) return;
    
    document.getElementById('modal-project-name').textContent = name;
    document.getElementById('modal-project-size').textContent = size;
    document.getElementById('modal-project-type').textContent = type;
    
    // Conectar botones de vista y descarga a la URL temporal
    const viewBtn = document.getElementById('modal-view-btn');
    const downloadBtn = document.getElementById('modal-download-btn');

    if (viewBtn) {
        viewBtn.href = fileURL; // Abre el archivo en el navegador
    }

    if (downloadBtn) {
        downloadBtn.href = fileURL; // Descarga el archivo
        downloadBtn.download = name; // Sugiere el nombre original para la descarga
    }

    modal.classList.remove('hidden');
}

function closeViewModal() {
    document.getElementById('view-modal').classList.add('hidden');
}

// ===============================================
// INICIO DE LA APLICACIÓN (EVENT LISTENERS)
// ===============================================
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Cargar proyectos al inicio
    loadProjects(); 
    
    // 2. Inicializar íconos de Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // 3. Conectar el botón de abrir modal de subida
    const openUploadBtn = document.getElementById('open-upload-modal-btn');
    if (openUploadBtn) {
        openUploadBtn.addEventListener('click', openUploadModal);
    }

    // 4. Conectar el formulario de subida
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUploadSubmit);
    }
    
    // 5. Conectar botones de cierre de modales
    const closeUploadBtn = document.getElementById('close-upload-modal');
    if (closeUploadBtn) {
        closeUploadBtn.addEventListener('click', closeUploadModal);
    }

    const closeViewBtn = document.getElementById('close-view-modal');
    if (closeViewBtn) {
        closeViewBtn.addEventListener('click', closeViewModal);
    }

    // 6. Lógica de menú móvil
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });

        document.querySelectorAll('#mobile-menu a').forEach(item => {
            item.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
});