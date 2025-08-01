// Configuración centralizada para las URLs de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://explorador-planetario-api.onrender.com';

// URLs específicas para diferentes servicios
export const API_ENDPOINTS = {
  // Autenticación
  SIGN_UP: `${API_BASE_URL}/signUp`,
  SIGN_IN: `${API_BASE_URL}/signIn`,
  
  // Especies
  SPECIES: `${API_BASE_URL}/api/species`,
  
  // Comunidad
  COMMUNITY: `${API_BASE_URL}/community`,
  
  // Juegos
  GAMES: `${API_BASE_URL}/api/games`,
} as const; 