// Configuración centralizada para las URLs de la API
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  // En desarrollo, usar servidor local; en producción, usar Render
  import.meta.env.DEV ? 'http://localhost:3000' : 'https://explorador-planetario-api.onrender.com';

// URLs específicas para diferentes servicios
export const API_ENDPOINTS = {
  // Autenticación
  SIGN_UP: `${API_BASE_URL}/signUp`,
  SIGN_IN: `${API_BASE_URL}/signIn`,
  AUTH_SIGNIN: `${API_BASE_URL}/auth/signin`,
  AUTH_SIGNOUT: `${API_BASE_URL}/auth/signout`,
  AUTH_SESSION: `${API_BASE_URL}/auth/session`,
  
  // Especies
  SPECIES: `${API_BASE_URL}/api/species`,
  
  // Comunidad
  COMMUNITY: `${API_BASE_URL}/community`,
  
  // Juegos
  GAMES: `${API_BASE_URL}/api/games`,
  GAMES_TOP: (game: string) => `${API_BASE_URL}/api/games/top/${game}`,
  GAMES_STATS: `${API_BASE_URL}/api/games/stats`,
  GAMES_USER: (userId: string) => `${API_BASE_URL}/api/games/user/${userId}`,
  GAMES_MEMORY_SCORE: `${API_BASE_URL}/api/games/memory/score`,
  GAMES_CROSSWORD_SCORE: `${API_BASE_URL}/api/games/crossword/score`,
} as const; 