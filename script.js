//===============================================
// CONFIGURACIÓN DE FIREBASE (¡REEMPLAZA ESTO!)
// ===============================================

const FIREBASE_CONFIG = {
    apiKey: "AIzaSy...", // Tu clave API
    authDomain: "tu-dominio.firebaseapp.com",
    projectId: "tu-proyecto-id-12345",
    storageBucket: "tu-bucket.appspot.com", // IMPORTANTE
    messagingSenderId: "...",
    appId: "..."
};

// Inicializa Firebase
const app = firebase.initializeApp(FIREBASE_CONFIG);
const db = app.firestore();
const storage = app.storage();
const PROJECTS_COLLECTION = 'projects';


//===============================================
// UTILIDADES GENERALES
// ===============================================

/**
 * Muestra un mensaje temporal (toast).
 * @param {string} message - Mensaje.
 * @param {string} bgColor - Clase de color de fondo de Tailwind.
 */
function showTemporaryMessage(message, bgColor) {
    const toast = document.getElementById('toast-message');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white ${bgColor} transition-transform transform translate-y-0`;

    setTimeout(() => {
        toast.className = 'fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white transition-transform transform translate-y-20';
    }, 3000);
}

// Función para formatear el tamaño de archivo
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


// ===============================================
// LÓGICA DE GESTIÓN DE FIREBASE
// ===============================================

/**
 * Sube el archivo a Firebase Storage y guarda los metadatos en Firestore.
 * @param {Event} e - Evento del formulario.
 */
async function handleUploadSubmit(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('file-input');
    const nameInput = document.getElementById('project-name-input');
    const uploadButton = document.getElementById('upload-button');
    const progressBar = document.getElementById('upload-progress-bar');
    const progressContainer = document.getElementById('upload-progress-container');

    const file = fileInput.files[0];
    let projectName = nameInput.value.trim() || file.name;
    
    if (!file) return;

    // 1. Mostrar estado de subida
    uploadButton.disabled = true;
    uploadButton.innerHTML = 'Subiendo...';
    progressContainer.classList.remove('hidden');

    try {
        // 2. Crear una referencia única en Storage (carpeta/nombre_unico_timestamp.ext)
        const fileExtension = file.name.split('.').pop();
        const safeName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filePath = `proyectos/${safeName}_${Date.now()}.${fileExtension}`;
        const storageRef = storage.ref(filePath);
        
        // 3. Iniciar la subida
        const uploadTask = storageRef.put(file);

        // 4. Observar el progreso
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progress + '%';
                uploadButton.innerHTML = `Subiendo... ${Math.round(progress)}%`;
            }, 
            (error) => {
                // Manejar errores de subida
                throw new Error(`Error de subida: ${error.message}`);
            }, 
            async () => {
                // 5. Subida completa: Obtener URL y guardar en Firestore
                const fileURL = await storageRef.getDownloadURL();
                
                const projectData = {
                    name: projectName,
                    size: file.size,
                    type: file.type || 'N/A',
                    uploadDate: firebase.firestore.Timestamp.fromDate(new Date()),
                    fileURL: fileURL,
                    storagePath: filePath
                };

                // 6. Guardar la metadata en Firestore
                await db.collection(PROJECTS_COLLECTION).add(projectData);
                
                showTemporaryMessage('✅ Proyecto subido y registrado con éxito.', 'bg-green-500');
                closeUploadModal();
                // Firestore recargará la lista automáticamente (ver loadProjects)
            }
        );
    } catch (error) {
        console.error("Error al subir proyecto:", error);
        showTemporaryMessage(`Error al subir: ${error.message}`, 'bg-red-500');
    } finally {
        uploadButton.disabled = false;
        uploadButton.innerHTML = 'Subir a la Nube';
        progressBar.style.width = '0%';
        progressContainer.classList.add('hidden');
        nameInput.value = '';
        fileInput.value = '';
    }
}

/**
 * Elimina el archivo de Storage y el registro de Firestore.
 * @param {string} docId - ID del documento en Firestore.
 * @param {string} storagePath - Ruta del archivo en Storage.
 */
async function deleteProject(docId, storagePath) {
    if (!confirm('¿Estás seguro de que quieres eliminar ESTE PROYECTO?')) return;

    try {
        // 1. Eliminar de Firebase Storage
        const storageRef = storage.ref(storagePath);
        await storageRef.delete();
        
        // 2. Eliminar de Firestore Database
        await db.collection(PROJECTS_COLLECTION).doc(docId).delete();
        
        showTemporaryMessage('🗑️ Proyecto eliminado permanentemente.', 'bg-red-600');
        closeViewModal();
        // Firestore recargará la lista automáticamente
        
    } catch (error) {
        console.error("Error al eliminar proyecto:", error);
        // Si el archivo ya no existe en Storage, solo eliminamos el registro de Firestore
        if (error.code === 'storage/object-not-found' || error.message.includes('storage/object-not-found')) {
             await db.collection(PROJECTS_COLLECTION).doc(docId).delete();
             showTemporaryMessage('Archivo no encontrado en Storage, registro eliminado.', 'bg-yellow-600');
        } else {
            showTemporaryMessage(`Error al eliminar: ${error.message}`, 'bg-red-500');
        }
    }
}


// ===============================================
// LÓGICA DE RENDERIZADO Y UI
// ===============================================

/** * Establece un listener para cargar y renderizar proyectos en tiempo real.
 * Usamos onSnapshot para que la lista se actualice automáticamente.
 */
function loadProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    // Escucha los cambios en la colección de proyectos (en tiempo real)
    db.collection(PROJECTS_COLLECTION)
        .orderBy('uploadDate', 'desc') // Ordenar por fecha de subida
        .limit(8)
        .onSnapshot(snapshot => {
            const projects = [];
            snapshot.forEach(doc => {
                projects.push({
                    id: doc.id, // ID del documento de Firestore
                    ...doc.data()
                });
            });
            renderProjects(projects, container);
        }, error => {
            console.error("Error al obtener documentos:", error);
            container.innerHTML = `<p class="text-red-500 col-span-full text-center p-8 bg-dark-card rounded-xl">Error al conectar con la base de datos: ${error.message}</p>`;
        });
}

/** * Dibuja las tarjetas de proyectos en el contenedor.
 * @param {Array<Object>} projects - Lista de metadatos de proyectos.
 * @param {HTMLElement} container - Contenedor donde renderizar.
 */
function renderProjects(projects, container) {
    container.innerHTML = ''; // Limpiar contenedor
    
    if (projects.length === 0) {
        container.innerHTML = `
             <div class="col-span-full text-center p-8 bg-dark-bg rounded-xl">
                 <p class="text-gray-400">Aún no hay proyectos subidos. ¡Sube el primer documento!</p>
             </div>
           `;
        return;
    } 

    projects.forEach(project => {
        const date = project.uploadDate.toDate().toLocaleDateString('es-ES');
        const sizeDisplay = formatBytes(project.size);
        
        const card = `
            <div class="bg-dark-card rounded-xl p-6 shadow-2xl hover:shadow-primary-blue/30 transition-shadow duration-300 flex flex-col justify-between">
                <div>
                    <div class="bg-gray-700 h-10 w-10 rounded-full mb-4 flex items-center justify-center">
                        <i data-lucide="file-text" class="w-6 h-6 text-primary-blue"></i>
                    </div>
                    <h3 class="text-2xl font-semibold mb-2 text-primary-blue line-clamp-2" title="${project.name}">
                        ${project.name}
                    </h3>
                    <p class="text-gray-400 text-sm mb-2">
                        Tipo: ${project.type}
                    </p>
                    <p class="text-gray-500 text-xs mb-4">
                        Subido: ${date} | Tamaño: ${sizeDisplay}
                    </p>
                </div>
                
                <div class="flex space-x-2 mt-4">
                    <button 
                        data-project-id="${project.id}" 
                        data-file-name="${project.name}" 
                        data-file-size="${sizeDisplay}"
                        data-file-type="${project.type}"
                        data-file-url="${project.fileURL}"
                        data-storage-path="${project.storagePath}"
                        class="view-project-btn w-3/4 px-4 py-2 text-sm font-bold text-white rounded-full btn-primary"
                    >
                        Ver Detalles
                    </button>
                    
                    <button 
                        onclick="openModal('${project.name}', '${sizeDisplay}', '${project.type}', '${project.fileURL}', '${project.id}', '${project.storagePath}')"
                        class="w-1/4 px-2 py-2 text-sm font-bold rounded-full bg-gray-700 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        title="Eliminar Proyecto"
                    >
                        <i data-lucide="trash-2" class="w-4 h-4 mx-auto"></i>
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });

    // Crear íconos después de inyectar
    if (window.lucide) {
         window.lucide.createIcons();
    }
    
    // Asignar evento al botón de "Ver Detalles"
    document.querySelectorAll('.view-project-btn').forEach(button => {
        button.addEventListener('click', function() {
            openModal(
                this.dataset.fileName, 
                this.dataset.fileSize, 
                this.dataset.fileType,
                this.dataset.fileUrl,
                this.dataset.projectId,
                this.dataset.storagePath
            );
        });
    });
}

// ===============================================
// LÓGICA DE MODALES
// ===============================================

function openUploadModal() {
    document.getElementById('upload-modal').classList.remove('hidden');
}

function closeUploadModal() {
    document.getElementById('upload-modal').classList.add('hidden');
    document.getElementById('project-name-input').value = '';
    document.getElementById('file-input').value = '';
}

function openModal(name, size, type, fileURL, docId, storagePath) {
    const modal = document.getElementById('view-modal');
    if (!modal) return;
    
    document.getElementById('modal-project-name').textContent = name;
    document.getElementById('modal-project-size').textContent = size;
    document.getElementById('modal-project-type').textContent = type;
    
    const viewBtn = document.getElementById('modal-view-btn');
    const downloadBtn = document.getElementById('modal-download-btn');
    const deleteBtn = document.getElementById('modal-delete-btn');

    // Conectar botones a la URL y a la función de eliminación
    if (viewBtn) viewBtn.href = fileURL; 
    if (downloadBtn) downloadBtn.href = fileURL;
    
    // Conectar la función de eliminación, pasando el ID de Firestore y la ruta de Storage
    if (deleteBtn) {
        deleteBtn.onclick = () => deleteProject(docId, storagePath);
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
    
    // 1. Cargar proyectos (se hace en tiempo real con onSnapshot)
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
