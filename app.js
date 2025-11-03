// Estado de la aplicación
const state = {
    totalImages: 0,
    apiCalls: 0
};

// URLs de las APIs
const API_URLS = {
    catRandom: 'https://api.thecatapi.com/v1/images/search',
    catSearch: 'https://api.thecatapi.com/v1/images/search?breed_ids=',
    dogRandom: 'https://dog.ceo/api/breeds/image/random'
};

// Elementos del DOM
const elements = {
    btnCat: document.getElementById('btnCat'),
    btnDog: document.getElementById('btnDog'),
    btnMultiple: document.getElementById('btnMultiple'),
    btnSearch: document.getElementById('btnSearch'),
    searchInput: document.getElementById('searchInput'),
    imageContainer: document.getElementById('imageContainer'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    totalImages: document.getElementById('totalImages'),
    apiCalls: document.getElementById('apiCalls')
};

// Event Listeners
elements.btnCat.addEventListener('click', () => loadRandomCat());
elements.btnDog.addEventListener('click', () => loadRandomDog());
elements.btnMultiple.addEventListener('click', () => loadMultipleImages());
elements.btnSearch.addEventListener('click', () => searchCatBreed());
elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchCatBreed();
});

// Función para mostrar/ocultar loading
function toggleLoading(show) {
    elements.loading.classList.toggle('hidden', !show);
}

// Función para mostrar/ocultar error
function toggleError(show) {
    elements.error.classList.toggle('hidden', !show);
}

// Función para actualizar estadísticas
function updateStats() {
    elements.totalImages.textContent = state.totalImages;
    elements.apiCalls.textContent = state.apiCalls;
}

// Función para crear una tarjeta de imagen
function createImageCard(imageUrl, title, type) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = title;
    
    const info = document.createElement('div');
    info.className = 'image-info';
    
    const h3 = document.createElement('h3');
    h3.textContent = title;
    
    const p = document.createElement('p');
    p.textContent = `Tipo: ${type}`;
    
    info.appendChild(h3);
    info.appendChild(p);
    card.appendChild(img);
    card.appendChild(info);
    
    return card;
}

// Función para agregar imagen al contenedor
function addImageToContainer(imageUrl, title, type) {
    const card = createImageCard(imageUrl, title, type);
    elements.imageContainer.appendChild(card);
    state.totalImages++;
    updateStats();
}

// Función para limpiar el contenedor de imágenes
function clearImageContainer() {
    elements.imageContainer.innerHTML = '';
    state.totalImages = 0;
    updateStats();
}

// Función asíncrona para cargar un gato aleatorio
async function loadRandomCat() {
    try {
        toggleLoading(true);
        toggleError(false);
        
        const response = await fetch(API_URLS.catRandom);
        
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        
        const data = await response.json();
        state.apiCalls++;
        
        clearImageContainer();
        addImageToContainer(data[0].url, '🐱 Gato Aleatorio', 'Cat API');
        
    } catch (error) {
        console.error('Error al cargar gato:', error);
        toggleError(true);
    } finally {
        toggleLoading(false);
    }
}

// Función asíncrona para cargar un perro aleatorio
async function loadRandomDog() {
    try {
        toggleLoading(true);
        toggleError(false);
        
        const response = await fetch(API_URLS.dogRandom);
        
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        
        const data = await response.json();
        state.apiCalls++;
        
        clearImageContainer();
        addImageToContainer(data.message, '🐶 Perro Aleatorio', 'Dog CEO API');
        
    } catch (error) {
        console.error('Error al cargar perro:', error);
        toggleError(true);
    } finally {
        toggleLoading(false);
    }
}

// Función asíncrona para cargar múltiples imágenes usando Promise.all
async function loadMultipleImages() {
    try {
        toggleLoading(true);
        toggleError(false);
        clearImageContainer();
        
        // Crear un array de promesas (3 gatos y 3 perros)
        const promises = [
            fetch(API_URLS.catRandom).then(r => r.json()),
            fetch(API_URLS.catRandom).then(r => r.json()),
            fetch(API_URLS.catRandom).then(r => r.json()),
            fetch(API_URLS.dogRandom).then(r => r.json()),
            fetch(API_URLS.dogRandom).then(r => r.json()),
            fetch(API_URLS.dogRandom).then(r => r.json())
        ];
        
        // Esperar a que todas las promesas se resuelvan
        const results = await Promise.all(promises);
        
        // Incrementar el contador de llamadas API
        state.apiCalls += 6;
        
        // Agregar las imágenes de gatos (primeras 3)
        results.slice(0, 3).forEach((data, index) => {
            addImageToContainer(data[0].url, `🐱 Gato #${index + 1}`, 'Cat API');
        });
        
        // Agregar las imágenes de perros (últimas 3)
        results.slice(3, 6).forEach((data, index) => {
            addImageToContainer(data.message, `🐶 Perro #${index + 1}`, 'Dog CEO API');
        });
        
    } catch (error) {
        console.error('Error al cargar múltiples imágenes:', error);
        toggleError(true);
    } finally {
        toggleLoading(false);
    }
}

// Función asíncrona para buscar gatos por raza
async function searchCatBreed() {
    const searchTerm = elements.searchInput.value.trim();
    
    if (!searchTerm) {
        alert('Por favor ingresa un término de búsqueda');
        return;
    }
    
    try {
        toggleLoading(true);
        toggleError(false);
        clearImageContainer();
        
        // Primero buscamos la raza
        const breedsResponse = await fetch('https://api.thecatapi.com/v1/breeds');
        const breeds = await breedsResponse.json();
        state.apiCalls++;
        
        // Filtrar razas que coincidan con el término de búsqueda
        const matchingBreed = breeds.find(breed => 
            breed.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (!matchingBreed) {
            elements.imageContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <h2>😿 No se encontró la raza "${searchTerm}"</h2>
                    <p>Intenta con: Siamese, Persian, Bengal, Maine Coon, etc.</p>
                </div>
            `;
            return;
        }
        
        // Buscar imágenes de esa raza
        const imagesResponse = await fetch(`${API_URLS.catSearch}${matchingBreed.id}&limit=6`);
        const images = await imagesResponse.json();
        state.apiCalls++;
        
        if (images.length === 0) {
            elements.imageContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <h2>😿 No se encontraron imágenes de ${matchingBreed.name}</h2>
                </div>
            `;
            return;
        }
        
        // Mostrar las imágenes encontradas
        images.forEach((img, index) => {
            addImageToContainer(
                img.url, 
                `${matchingBreed.name} #${index + 1}`, 
                'Cat API'
            );
        });
        
    } catch (error) {
        console.error('Error al buscar raza:', error);
        toggleError(true);
    } finally {
        toggleLoading(false);
    }
}

// Inicialización: Cargar una imagen de gato al inicio
window.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 Explorador de API inicializado');
    loadRandomCat();
});
