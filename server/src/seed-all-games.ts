import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nombres de usuarios para generar variedad
const userNames = [
  'AdminGEP', 'Anónimo', 'Usuario Invitado', 'Jugador1', 'Jugador2', 'Jugador3',
  'Jugador4', 'Jugador5', 'Jugador6', 'Jugador7', 'Jugador8', 'Jugador9', 'Jugador10',
  'Explorador1', 'Explorador2', 'Explorador3', 'Explorador4', 'Explorador5',
  'Científico1', 'Científico2', 'Científico3', 'Científico4', 'Científico5',
  'Estudiante1', 'Estudiante2', 'Estudiante3', 'Estudiante4', 'Estudiante5',
  'Profesor1', 'Profesor2', 'Profesor3', 'Profesor4', 'Profesor5',
  'Investigador1', 'Investigador2', 'Investigador3', 'Investigador4', 'Investigador5',
  'Aventurero1', 'Aventurero2', 'Aventurero3', 'Aventurero4', 'Aventurero5',
  'Naturalista1', 'Naturalista2', 'Naturalista3', 'Naturalista4', 'Naturalista5'
];

// Dificultades disponibles
const difficulties = ['facil', 'medio', 'dificil'];

// Función para generar puntuación aleatoria
function generateRandomScore(difficulty: string): number {
  const baseScore = Math.floor(Math.random() * 1000) + 100;
  const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
  return Math.round(baseScore * difficultyMultiplier);
}

// Función para generar tiempo aleatorio
function generateRandomTime(difficulty: string): number {
  const baseTime = difficulty === 'facil' ? 30 : difficulty === 'medio' ? 90 : 150;
  const variation = Math.floor(Math.random() * 60) + 10;
  return baseTime + variation;
}

// Función para generar movimientos aleatorios
function generateRandomMoves(difficulty: string): number {
  const baseMoves = difficulty === 'facil' ? 8 : difficulty === 'medio' ? 15 : 25;
  const variation = Math.floor(Math.random() * 10) + 2;
  return baseMoves + variation;
}

// Función para generar palabras completadas aleatorias
function generateRandomWords(difficulty: string): number {
  const baseWords = difficulty === 'facil' ? 5 : difficulty === 'medio' ? 8 : 12;
  const variation = Math.floor(Math.random() * 5) + 1;
  return baseWords + variation;
}

// Función para generar fecha aleatoria en los últimos 30 días
function generateRandomDate(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

async function seedAllGames() {
  try {
    console.log('🌱 Iniciando seed de todos los juegos...');

    // Generar puntuaciones para MEMORIA
    console.log('🧠 Generando puntuaciones para Memoria...');
    const memoryScores = [];
    for (let i = 0; i < 50; i++) {
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const userName = userNames[Math.floor(Math.random() * userNames.length)];
      const score = generateRandomScore(difficulty);
      const tiempo = generateRandomTime(difficulty);
      const movimientos = generateRandomMoves(difficulty);
      const date = generateRandomDate();

      memoryScores.push({
        id: `memory-${Date.now()}-${i}`,
        userId: Math.random() > 0.3 ? `user-${i}` : null,
        userName,
        game: 'memory',
        score,
        movimientos,
        tiempo,
        dificultad: difficulty,
        date,
        palabrasCompletadas: null
      });
    }

    // Generar puntuaciones para CRUCIGRAMA
    console.log('📝 Generando puntuaciones para Crucigrama...');
    const crosswordScores = [];
    for (let i = 0; i < 50; i++) {
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const userName = userNames[Math.floor(Math.random() * userNames.length)];
      const score = generateRandomScore(difficulty);
      const tiempo = generateRandomTime(difficulty);
      const palabrasCompletadas = generateRandomWords(difficulty);
      const date = generateRandomDate();

      crosswordScores.push({
        id: `crossword-${Date.now()}-${i}`,
        userId: Math.random() > 0.3 ? `user-${i}` : null,
        userName,
        game: 'crossword',
        score,
        movimientos: null,
        tiempo,
        dificultad: difficulty,
        date,
        palabrasCompletadas
      });
    }

    // Generar puntuaciones para QUIZ
    console.log('❓ Generando puntuaciones para Quiz...');
    const quizScores = [];
    for (let i = 0; i < 50; i++) {
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const userName = userNames[Math.floor(Math.random() * userNames.length)];
      const score = generateRandomScore(difficulty);
      const tiempo = generateRandomTime(difficulty);
      const movimientos = Math.floor(Math.random() * 20) + 5;
      const date = generateRandomDate();

      quizScores.push({
        id: `quiz-${Date.now()}-${i}`,
        userId: Math.random() > 0.3 ? `user-${i}` : null,
        userName,
        game: 'quiz',
        score,
        movimientos,
        tiempo,
        dificultad: difficulty,
        date,
        palabrasCompletadas: null
      });
    }

    // Generar puntuaciones para ADIVINA EL ANIMAL
    console.log('🐾 Generando puntuaciones para Adivina el Animal...');
    const guessScores = [];
    for (let i = 0; i < 50; i++) {
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const userName = userNames[Math.floor(Math.random() * userNames.length)];
      const score = generateRandomScore(difficulty);
      const tiempo = generateRandomTime(difficulty);
      const movimientos = Math.floor(Math.random() * 15) + 3;
      const date = generateRandomDate();

      guessScores.push({
        id: `guess-${Date.now()}-${i}`,
        userId: Math.random() > 0.3 ? `user-${i}` : null,
        userName,
        game: 'guess',
        score,
        movimientos,
        tiempo,
        dificultad: difficulty,
        date,
        palabrasCompletadas: null
      });
    }

    // Insertar todas las puntuaciones en la base de datos
    console.log('💾 Insertando puntuaciones en la base de datos...');
    
    const allScores = [...memoryScores, ...crosswordScores, ...quizScores, ...guessScores];
    
    for (const score of allScores) {
      await prisma.gameScore.create({
        data: score
      });
    }

    console.log('✅ Seed completado exitosamente!');
    console.log(`📊 Total de puntuaciones generadas: ${allScores.length}`);
    console.log(`🧠 Memoria: ${memoryScores.length} puntuaciones`);
    console.log(`📝 Crucigrama: ${crosswordScores.length} puntuaciones`);
    console.log(`❓ Quiz: ${quizScores.length} puntuaciones`);
    console.log(`🐾 Adivina el Animal: ${guessScores.length} puntuaciones`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el seed
seedAllGames();
