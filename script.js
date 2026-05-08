/**
 * PetStory - Nuestra historia juntos
 * Archivo script.js - Fase 3: Lógica Avanzada, DOM y Seguridad Estricta.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ---- 1. REFERENCIAS AL DOM ----
    const form = document.getElementById('milestone-form');
    const inputName = document.getElementById('petName');
    const inputDate = document.getElementById('eventDate');
    const inputType = document.getElementById('eventType');
    const inputDesc = document.getElementById('eventDesc');
    const timelineContainer = document.getElementById('timeline');
    
    // Variables para File Upload
    const inputImage = document.getElementById('petImage');
    const fileChosen = document.getElementById('file-chosen');
    let base64Image = null; // Almacenará la imagen en base64

    // Mapeo útil para validaciones
    const inputsConfig = [
        { el: inputName, errorId: 'error-petName', errorMsg: 'El nombre es obligatorio.' },
        { el: inputDate, errorId: 'error-eventDate', errorMsg: 'La fecha es obligatoria.' },
        { el: inputType, errorId: 'error-eventType', errorMsg: 'Selecciona el tipo de evento.' },
        { el: inputDesc, errorId: 'error-eventDesc', errorMsg: 'Por favor, añade una descripción.' }
    ];

    // ---- 2. ESTRUCTURA DE DATOS Y PERSISTENCIA ----
    const STORAGE_KEY = 'petStoryEvents_Secure';
    let eventsArr = [];

    // Escuchar cambios en el input file para validar y redimensionar
    if(inputImage) {
        inputImage.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                
                // Validación de tipo (solo imágenes)
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, sube solo archivos de imagen (JPG, PNG, WEBP).');
                    this.value = '';
                    fileChosen.textContent = 'Subir foto de mascota (Opcional)';
                    base64Image = null;
                    return;
                }
                
                // Validación de tamaño (Max 5MB original)
                if (file.size > 5 * 1024 * 1024) {
                    alert('La imagen es demasiado grande. El límite es 5MB.');
                    this.value = '';
                    fileChosen.textContent = 'Subir foto de mascota (Opcional)';
                    base64Image = null;
                    return;
                }

                fileChosen.textContent = file.name;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        // Compresión con Canvas (Max ancho/alto 800px)
                        const MAX_SIZE = 800;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                            }
                        } else {
                            if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                            }
                        }

                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Guardar como webp para mayor compresión (calidad 80%)
                        base64Image = canvas.toDataURL('image/webp', 0.8);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                fileChosen.textContent = 'Subir foto de mascota (Opcional)';
                base64Image = null;
            }
        });
    }

    // (Sanitización manual eliminada: Se utiliza textContent en el renderizado, lo cual previene XSS de forma nativa sin romper los caracteres especiales del usuario)
    /**
     * Devuelve una imagen decorativa (SVG en Data URI) según el tipo de evento
     * para asegurar que los assets sean locales y seguros.
     * @param {string} type 
     */
    const obtenerImagenPlaceholder = (type) => {
        // Paletas de color según tipo de evento
        const colors = {
            nacimiento: 'FF9AAB',
            logro: '06D6A0',
            viaje: '118AB2',
            cumpleanos: 'FFD166',
            travesura: 'EF476F'
        };
        const c = colors[type] || 'CCCCCC';
        
        // Ícono de huellita en base al color
        const svgPath = "M12 2c-3.3 0-6 2.7-6 6 0 1.2.3 2.3.9 3.3.4.6 1.4.9 2.2.6 1-.3 1.5-1.5.9-2.5C9.4 8.5 9 7.3 9 6c0-1.7 1.3-3 3-3s3 1.3 3 3c0 1.3-.4 2.5-1 3.4-.6 1-.1 2.2.9 2.5.8.3 1.7 0 2.2-.6.5-1 .9-2.1.9-3.3 0-3.3-2.7-6-6-6zm-4.5 13.5c-1 0-2 .2-2.9.6-.8.4-1.3 1.2-1.3 2.1v.3c0 2 1.3 3.8 3.2 4.3 1.7.4 3.6.4 5.3 0 1.9-.5 3.2-2.3 3.2-4.3v-.3c0-.9-.5-1.7-1.3-2.1-.9-.4-1.9-.6-2.9-.6-1 0-2.1.2-3.3.61-1.2-.41-2.3-.61-3.3-.61z";
        
        return `data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${c}'%3E%3Cpath d='${svgPath}'/%3E%3C/svg%3E`;
    };

    // ---- 3. LOGICA Y UI/UX (MOTION DESIGN) ----

    /**
     * Valida si un campo no está vacío y dispara animaciones dinámicas.
     */
    const validarInput = (element, errorId, errorMsg) => {
        const value = element.value.trim();
        const errorContainer = document.getElementById(errorId);

        if (!value) {
            // Disparar animación de error en CSS
            element.classList.remove('valid-border');
            element.classList.add('shake');
            
            // Reiniciar animación para futuros intentos
            setTimeout(() => {
                element.classList.remove('shake');
            }, 400);

            errorContainer.textContent = errorMsg; // Seguro: es textContent
            errorContainer.classList.add('visible');
            return false;
        } else {
            // Estado válido con validación visual verde
            element.classList.remove('shake');
            element.classList.add('valid-border');
            
            errorContainer.textContent = '';
            errorContainer.classList.remove('visible');
            return true;
        }
    };

    /**
     * INYECCIÓN SEGURA DEL DOM.
     * Crea los elementos HTML uno a uno utilizando document.createElement.
     * Prohibido estrictamente usar innerHTML por requerimiento de seguridad.
     */
    const renderizarEventoVDOM = (eventoData) => {
        // Elementos principales
        const article = document.createElement('article');
        article.className = 'timeline-card';
        article.id = `evento-${eventoData.id}`;

        const img = document.createElement('img');
        if (eventoData.image) {
            img.className = 'card-img-placeholder uploaded-img';
            img.src = eventoData.image; // Base64 inyectado
        } else {
            img.className = 'card-img-placeholder';
            img.src = obtenerImagenPlaceholder(eventoData.type);
        }
        img.alt = `Icono de evento ${eventoData.type}`;

        const divContent = document.createElement('div');
        divContent.className = 'card-content';

        // Cabecera de la tarjeta
        const divHeader = document.createElement('div');
        divHeader.className = 'card-header';

        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = eventoData.name; // Seguro: usando .textContent

        const wrapDateDel = document.createElement('div');
        wrapDateDel.style.display = 'flex';
        wrapDateDel.style.alignItems = 'center';

        const dateBadge = document.createElement('span');
        dateBadge.className = 'card-date';
        dateBadge.textContent = eventoData.date; // Seguro

        const btnDelete = document.createElement('button');
        btnDelete.className = 'delete-btn';
        btnDelete.setAttribute('aria-label', 'Eliminar momento');
        btnDelete.textContent = '🗑️'; // Icono seguro
        btnDelete.addEventListener('click', () => eliminarEvento(eventoData.id));

        wrapDateDel.appendChild(dateBadge);
        wrapDateDel.appendChild(btnDelete);

        divHeader.appendChild(title);
        divHeader.appendChild(wrapDateDel);

        // Subtítulo tipo de evento
        const mapTipos = {
            nacimiento: 'Nacimiento / Adopción',
            logro: 'Primer Logro',
            viaje: 'Viaje / Paseo',
            cumpleanos: 'Cumpleaños',
            travesura: 'Travesura'
        };

        const typeSpan = document.createElement('span');
        typeSpan.className = 'card-type';
        typeSpan.textContent = mapTipos[eventoData.type] || 'Momento Especial'; // Seguro

        // Descripción
        const descP = document.createElement('p');
        descP.className = 'card-desc';
        descP.textContent = eventoData.desc; // INYECCIÓN TOTALMENTE SEGURA CONTRA XSS

        // Ensamblar
        divContent.appendChild(divHeader);
        divContent.appendChild(typeSpan);
        divContent.appendChild(descP);

        article.appendChild(img);
        article.appendChild(divContent);

        // Prepend intercala el nuevo evento al inicio
        timelineContainer.prepend(article);

        // Motion Design: Disparar animación de fade-in-up al entrar al DOM
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                article.classList.add('enter-active');
            });
        });
    };

    const cargarEventosStorage = () => {
        try {
            const dataStr = localStorage.getItem(STORAGE_KEY);
            if (dataStr) {
                eventsArr = JSON.parse(dataStr);
                // Si están ordenados del más nuevo al más viejo, renderizamos al revés con prepend
                // Para mantener orden de adición, se iteran
                eventsArr.forEach(evt => renderizarEventoVDOM(evt));
            }
        } catch (e) {
            console.error('Error al parsear el LocalStorage', e);
        }
    };

    const guardarEventosStorage = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsArr));
            return true;
        } catch (e) {
            console.error('Error al guardar en LocalStorage', e);
            if (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                alert('¡Ups! El almacenamiento está lleno (las imágenes de alta resolución ocupan mucho espacio). Intenta eliminar algunos eventos o subir fotos más ligeras.');
            } else {
                alert('Ocurrió un error al intentar guardar el evento.');
            }
            return false;
        }
    };

    /**
     * Animación de salida antes de destruir nodo
     */
    const eliminarEvento = (id) => {
        const elemento = document.getElementById(`evento-${id}`);
        if(elemento) {
            // Animación de desvanecimiento de salida (UX/Motion)
            elemento.style.transition = 'all 0.4s ease-in-out';
            elemento.style.opacity = '0';
            elemento.style.transform = 'translateY(20px) scale(0.95)';

            setTimeout(() => {
                elemento.remove();
            }, 400); // Mismo tiempo que the CSS transition
        }

        // Actualizar array y persistir
        eventsArr = eventsArr.filter(e => e.id !== id);
        guardarEventosStorage();
    };


    // ---- 4. HANDLERS E INITIALIZERS ----

    /**
     * Función Modular para Capturar Formulario
     */
    const procesarFormulario = (e) => {
        e.preventDefault();

        // Ejecutar todas las validaciones
        let isValid = true;
        inputsConfig.forEach(conf => {
            if(!validarInput(conf.el, conf.errorId, conf.errorMsg)) {
                isValid = false;
            }
        });

        // Abortar si falta algo
        if (!isValid) return;

        // Capturar datos y Crear Objeto (Sin doble sanitización, textContent protegerá en la vista)
        const nuevoEvento = {
            id: Date.now(),
            name: inputName.value.trim(),
            date: inputDate.value.trim(),
            type: inputType.value.trim(),
            desc: inputDesc.value.trim(),
            image: base64Image
        };

        // Guardar en Array y LocalStorage
        eventsArr.push(nuevoEvento);
        const guardadoExitoso = guardarEventosStorage();

        if (!guardadoExitoso) {
            // Si falla el guardado (ej. cuota excedida), revertimos y abortamos
            eventsArr.pop();
            return;
        }

        // Renderizar dinámicamente con animaciones
        renderizarEventoVDOM(nuevoEvento);

        // UX: Restaurar estado inicial
        form.reset();
        base64Image = null;
        if(fileChosen) fileChosen.textContent = 'Subir foto de mascota (Opcional)';
        
        inputsConfig.forEach(conf => {
            conf.el.classList.remove('valid-border', 'shake');
        });
    };

    // Validación "en vivo" para UX fluida cuando el usuario abandona el campo
    inputsConfig.forEach(conf => {
        conf.el.addEventListener('blur', () => {
            if(conf.el.value.trim() !== '') {
                conf.el.classList.add('valid-border');
                conf.el.classList.remove('shake');
                document.getElementById(conf.errorId).classList.remove('visible');
            }
        });
    });

    // Binding de eventos principales
    form.addEventListener('submit', procesarFormulario);

    // Bootstrapping App
    cargarEventosStorage();
});