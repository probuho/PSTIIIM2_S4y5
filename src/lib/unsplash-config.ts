/**
 * CONFIGURACIÓN DE UNSPLASH API
 * 
 * Este archivo contiene la configuración para usar la API de Unsplash
 * y obtener imágenes de alta calidad para el proyecto.
 */

// Configuración de la API de Unsplash
export const UNSPLASH_CONFIG = {
  ACCESS_KEY: "7FkF5_XyctvHJ6T1ELsXgDS7M4SArPI3e0uRVGLiWcY",
  SECRET_KEY: "qALgWGmZUzOJtAXF7M93Y3EIcFgw8FZgXWzaNpD69n0",
  BASE_URL: "https://api.unsplash.com",
  SEARCH_ENDPOINT: "/search/photos",
  RANDOM_ENDPOINT: "/photos/random",
};

// URLs predefinidas de imágenes de animales para usar como respaldo
export const UNSPLASH_IMAGES = {
  // Leopardos
  amurLeopard: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&h=300&fit=crop",
  
  // Primates
  orangutan: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=400&h=300&fit=crop",
  gorilla: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=400&h=300&fit=crop",
  
  // Mamíferos marinos
  dolphin: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
  whale: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
  
  // Rinocerontes
  rhinoceros: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
  
  // Pandas
  panda: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&h=300&fit=crop",
  
  // Lugares naturales
  forest: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
  mountain: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
  ocean: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
  jungle: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
};

/**
 * Función para construir URLs de Unsplash con parámetros
 */
export const buildUnsplashUrl = (
  endpoint: string,
  params: Record<string, string> = {}
): string => {
  const url = new URL(`${UNSPLASH_CONFIG.BASE_URL}${endpoint}`);
  
  // Agregar parámetros de consulta
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return url.toString();
};

/**
 * Función para buscar fotos en Unsplash
 */
export const searchUnsplashPhotos = async (
  query: string,
  count: number = 10
): Promise<any[]> => {
  try {
    const url = buildUnsplashUrl(UNSPLASH_CONFIG.SEARCH_ENDPOINT, {
      query,
      per_page: count.toString(),
      client_id: UNSPLASH_CONFIG.ACCESS_KEY,
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error en la búsqueda: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error al buscar fotos en Unsplash:", error);
    return [];
  }
};

/**
 * Función para obtener una foto aleatoria de Unsplash
 */
export const getRandomUnsplashPhoto = async (
  query?: string
): Promise<string | null> => {
  try {
    const params: Record<string, string> = {
      client_id: UNSPLASH_CONFIG.ACCESS_KEY,
    };

    if (query) {
      params.query = query;
    }

    const url = buildUnsplashUrl(UNSPLASH_CONFIG.RANDOM_ENDPOINT, params);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error al obtener foto aleatoria: ${response.status}`);
    }

    const data = await response.json();
    return data.urls?.regular || null;
  } catch (error) {
    console.error("Error al obtener foto aleatoria:", error);
    return null;
  }
};

/**
 * Función para obtener imágenes específicas de animales
 */
export const getAnimalImage = async (animalName: string): Promise<string> => {
  try {
    // Intentar obtener una imagen específica del animal
    const imageUrl = await getRandomUnsplashPhoto(animalName);
    
    if (imageUrl) {
      return `${imageUrl}?w=400&h=300&fit=crop`;
    }
    
    // Si no se encuentra, usar una imagen predefinida
    const fallbackImages = {
      leopard: UNSPLASH_IMAGES.amurLeopard,
      orangutan: UNSPLASH_IMAGES.orangutan,
      gorilla: UNSPLASH_IMAGES.gorilla,
      dolphin: UNSPLASH_IMAGES.dolphin,
      whale: UNSPLASH_IMAGES.whale,
      rhinoceros: UNSPLASH_IMAGES.rhinoceros,
      panda: UNSPLASH_IMAGES.panda,
    };
    
    const fallbackKey = animalName.toLowerCase();
    return fallbackImages[fallbackKey as keyof typeof fallbackImages] || UNSPLASH_IMAGES.amurLeopard;
  } catch (error) {
    console.error(`Error al obtener imagen de ${animalName}:`, error);
    return UNSPLASH_IMAGES.amurLeopard;
  }
};

/**
 * Función para obtener imágenes de lugares naturales
 */
export const getPlaceImage = async (placeName: string): Promise<string> => {
  try {
    const imageUrl = await getRandomUnsplashPhoto(placeName);
    
    if (imageUrl) {
      return `${imageUrl}?w=400&h=300&fit=crop`;
    }
    
    // Imágenes predefinidas de lugares
    const fallbackImages = {
      forest: UNSPLASH_IMAGES.forest,
      mountain: UNSPLASH_IMAGES.mountain,
      ocean: UNSPLASH_IMAGES.ocean,
      jungle: UNSPLASH_IMAGES.jungle,
    };
    
    const fallbackKey = placeName.toLowerCase();
    return fallbackImages[fallbackKey as keyof typeof fallbackImages] || UNSPLASH_IMAGES.forest;
  } catch (error) {
    console.error(`Error al obtener imagen de ${placeName}:`, error);
    return UNSPLASH_IMAGES.forest;
  }
}; 