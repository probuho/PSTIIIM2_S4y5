/**
 * DATOS DE JUEGOS - Módulo de Juegos Educativos
 * 
 * Este archivo contiene toda la información estática de los juegos disponibles
 * en la aplicación. Cada juego tiene propiedades específicas que se usan
 * para mostrar las tarjetas en la página principal.
 */

// Array principal que contiene todos los juegos disponibles
export const games = [
  {
    id: "memoria",
    title: "Memoria",
    description:
      "Pon a prueba tus habilidades de memoria emparejando tarjetas con especies de vida silvestre",
    icon: "🧠",
    link: "/games/memory",
  },
  {
    id: "crucigrama",
    title: "Crucigrama de identificación de especies",
    description:
      "Prueba tu capacidad para identificar diferentes especies de animales",
    icon: "🦋",
    link: "/games/crossword",
  },
  {
    id: "quiz",
    title: "Quiz del reino animal",
    description:
      "Pon a prueba tus conocimientos sobre el reino animal en este quiz de la naturaleza",
    icon: "🌍",
    link: "/games/quiz",
  },
  {
    id: "ahorcado",
    title: "Ahorcado de especies animales",
    description:
      "Descubre que tan bien conoces a las criaturas que cubren este planeta adivinando la especie",
    icon: "🌱",
    link: "/games/hangman",
  },
];

/**
 * DATOS ADICIONALES PARA EL JUEGO DE MEMORIA
 * 
 * Esta sección contiene información específica para el juego de memoria,
 * incluyendo reglas y estadísticas de ejemplo.
 */

// Información de "Cómo jugar" para el juego de memoria
export const easyMemory = [
  {
    icon: "❕",
    title: "Cómo jugar",
    subTitle: "Reglas del juego",
    description: `Da vuelta las cartas para encontrar parejas. Aprende sobre cada especie al hacer un acierto.\nCompleta el tablero lo más rápido posible.`,
  },
  {
    icon: "🎮",
    title: "Progreso de la partida",
    subTitle: "Tus estadísticas",
    description:
      "Mejor tiempo: 2:45 min | Especies identificadas: 18/30 | Racha actual: 3 partidas",
  },
];

/**
 * ESPECIES DESTACADAS
 * 
 * Lista de especies en peligro de extinción que se muestran
 * como ejemplos en el módulo de juegos.
 * 
 * NOTA: Las imágenes se cargan dinámicamente desde Unsplash API
 * para obtener imágenes de alta calidad y actualizadas.
 */
export const featuredSpecies = [
  {
    name: "Amur Leopard",
    description:
      "Critically endangered bit cat with fewer than 100 individuals left in the wild.",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&h=300&fit=crop",
    searchQuery: "amur leopard",
  },
  {
    name: "Sumatran Orangutan",
    description:
      "Critically endangered great ape found only in the northern parts of Sumatra.",
    image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=400&h=300&fit=crop",
    searchQuery: "sumatran orangutan",
  },
  {
    name: "Vaquita Porpoise",
    description:
      "The world's most rare marine mammal, with fewer than 10 individuals remaining.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
    searchQuery: "vaquita porpoise",
  },
  {
    name: "Javan Rhinoceros",
    description:
    "One of the rarest large mammals on Earth, with only about 75 individuals remaining.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
    searchQuery: "javan rhinoceros",
  },
  {
    name: "Mountain Gorilla",
    description:
      "Endangered great ape found in the mountains of central Africa.",
    image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=400&h=300&fit=crop",
    searchQuery: "mountain gorilla",
  },
  {
    name: "Giant Panda",
    description:
      "Beloved bear species native to China, symbol of wildlife conservation.",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&h=300&fit=crop",
    searchQuery: "giant panda",
  },
];

/**
 * FUNCIÓN PARA CARGAR IMÁGENES DINÁMICAS DESDE UNSPLASH
 * 
 * Esta función se puede usar para actualizar las imágenes de las especies
 * con fotos frescas y de alta calidad desde Unsplash.
 */
export const loadDynamicImages = async () => {
  try {
    // Importar las funciones de Unsplash
    const { getAnimalImage } = await import('../../lib/unsplash-config');
    
    // Actualizar cada especie con una imagen dinámica
    const updatedSpecies = await Promise.all(
      featuredSpecies.map(async (species) => {
        try {
          const dynamicImage = await getAnimalImage(species.searchQuery || species.name);
          return {
            ...species,
            image: dynamicImage,
          };
        } catch (error) {
          console.error(`Error al cargar imagen para ${species.name}:`, error);
          return species; // Mantener la imagen original si falla
        }
      })
    );
    
    return updatedSpecies;
  } catch (error) {
    console.error("Error al cargar imágenes dinámicas:", error);
    return featuredSpecies; // Retornar las especies originales si falla
  }
}; 