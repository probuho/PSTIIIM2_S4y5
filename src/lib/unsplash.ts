/**
 * Configuración de la API de Unsplash
 * 
 * Este archivo contiene la configuración para acceder a la API de Unsplash
 * y obtener imágenes de alta calidad para el proyecto.
 */

// Claves de la API de Unsplash
export const UNSPLASH_CONFIG = {
  ACCESS_KEY: "7FkF5_XyctvHJ6T1ELsXgDS7M4SArPI3e0uRVGLiWcY",
  SECRET_KEY: "qALgWGmZUzOJtAXF7M93Y3EIcFgw8FZgXWzaNpD69n0",
  APPLICATION_ID: "786692",
  BASE_URL: "https://api.unsplash.com",
};

/**
 * Función para construir URLs de Unsplash con parámetros optimizados
 */
export const buildUnsplashUrl = (
  photoId: string,
  width: number = 400,
  height: number = 300,
  quality: number = 80
): string => {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&h=${height}&fit=crop&q=${quality}`;
};

/**
 * URLs predefinidas de Unsplash para especies en peligro de extinción
 */
export const UNSPLASH_IMAGES = {
  // Leopard
  amurLeopard: buildUnsplashUrl("1561731216-c3a4d99437d5"),
  
  // Orangutan
  sumatranOrangutan: buildUnsplashUrl("1559827260-dc66d52bef19"),
  
  // Marine mammals
  vaquitaPorpoise: buildUnsplashUrl("1559827260-dc66d52bef19"),
  
  // Tigers
  bengalTiger: buildUnsplashUrl("1561731216-c3a4d99437d5"),
  
  // Elephants
  africanElephant: buildUnsplashUrl("1559827260-dc66d52bef19"),
  
  // Birds
  baldEagle: buildUnsplashUrl("1561731216-c3a4d99437d5"),
  
  // Marine life
  seaTurtle: buildUnsplashUrl("1559827260-dc66d52bef19"),
  
  // Wolves
  grayWolf: buildUnsplashUrl("1561731216-c3a4d99437d5"),
  
  // Bears
  polarBear: buildUnsplashUrl("1559827260-dc66d52bef19"),
  
  // Rhinos
  blackRhino: buildUnsplashUrl("1561731216-c3a4d99437d5"),
};

/**
 * Función para buscar fotos en Unsplash por término
 */
export const searchUnsplashPhotos = async (query: string, count: number = 10) => {
  try {
    const response = await fetch(
      `${UNSPLASH_CONFIG.BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_CONFIG.ACCESS_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching from Unsplash:", error);
    return [];
  }
};

/**
 * Función para obtener una foto aleatoria de Unsplash
 */
export const getRandomUnsplashPhoto = async (query: string) => {
  try {
    const response = await fetch(
      `${UNSPLASH_CONFIG.BASE_URL}/photos/random?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_CONFIG.ACCESS_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching random photo from Unsplash:", error);
    return null;
  }
}; 