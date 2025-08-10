/**
 * SCRIPT DE DATOS DE PRUEBA - PUNTUACIONES DE JUEGOS
 * 
 * Este script agrega puntuaciones de ejemplo a la base de datos
 * para que puedas ver cómo funciona el sistema de top scores.
 * 
 * USO:
 * - development: npm run seed-scores
 * - staging: NODE_ENV=staging npm run seed-scores  
 * - production: NODE_ENV=production npm run seed-scores
 */

import { PrismaClient } from '@prisma/client';
import { getConfig, getCurrentEnvironment } from './config/environments';

// Configuración dinámica según el entorno
const config = getConfig();
const currentEnv = getCurrentEnvironment();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url,
    },
  },
});

// Función para calcular puntuación (misma que en el controlador)
const calcularPuntuacion = (movimientos: number, tiempo: number, dificultad: string): number => {
  const factorMovimientos = 1000;
  const factorTiempo = 50;
  const factorDificultad = {
    "facil": 1,
    "medio": 1.5,
    "dificil": 2
  };

  let puntuacion = factorMovimientos / (movimientos + 1);
  
  const tiempoBase = dificultad === "facil" ? 60 : dificultad === "medio" ? 120 : 180;
  const tiempoBonus = Math.max(0, tiempoBase - tiempo) * factorTiempo;
  puntuacion += tiempoBonus;
  
  puntuacion *= factorDificultad[dificultad as keyof typeof factorDificultad] || 1;
  
  return Math.round(puntuacion);
};

async function seedScores() {
  try {
    console.log(`🌱 Agregando puntuaciones de prueba en entorno: ${currentEnv.toUpperCase()}`);
    console.log(`📊 Base de datos: ${config.database.name}`);

    // Verificar si ya existen datos (solo en desarrollo)
    if (currentEnv === 'development') {
      const existingScores = await prisma.gameScore.count();
      if (existingScores > 0) {
        console.log(`⚠️  Ya existen ${existingScores} puntuaciones en la base de datos`);
        const shouldContinue = process.argv.includes('--force');
        if (!shouldContinue) {
          console.log('💡 Usa --force para sobrescribir los datos existentes');
          return;
        }
      }
    }

    // Datos de prueba para el juego de Memoria
    const memoryScores = [
      { userName: "Probuho", movimientos: 15, tiempo: 45, dificultad: "facil" },
      { userName: "LuisMiguel", movimientos: 12, tiempo: 38, dificultad: "facil" },
      { userName: "Anónimo", movimientos: 18, tiempo: 52, dificultad: "facil" },
      { userName: "Explorador", movimientos: 10, tiempo: 30, dificultad: "medio" },
      { userName: "Conservador", movimientos: 8, tiempo: 25, dificultad: "dificil" },
      { userName: "Estudiante", movimientos: 20, tiempo: 60, dificultad: "facil" },
      { userName: "Profesor", movimientos: 14, tiempo: 42, dificultad: "medio" },
      { userName: "Investigador", movimientos: 11, tiempo: 35, dificultad: "medio" },
    ];

    // Datos de prueba para el juego de Crucigrama
    const crosswordScores = [
      { userName: "Probuho", palabrasCompletadas: 8, tiempo: 120, dificultad: "facil" },
      { userName: "LuisMiguel", palabrasCompletadas: 10, tiempo: 95, dificultad: "facil" },
      { userName: "Anónimo", palabrasCompletadas: 6, tiempo: 150, dificultad: "facil" },
      { userName: "Explorador", palabrasCompletadas: 12, tiempo: 80, dificultad: "medio" },
      { userName: "Conservador", palabrasCompletadas: 15, tiempo: 65, dificultad: "dificil" },
      { userName: "Estudiante", palabrasCompletadas: 7, tiempo: 130, dificultad: "facil" },
      { userName: "Profesor", palabrasCompletadas: 11, tiempo: 88, dificultad: "medio" },
      { userName: "Investigador", palabrasCompletadas: 9, tiempo: 105, dificultad: "medio" },
    ];

    // Crear puntuaciones de memoria
    for (const score of memoryScores) {
      const puntuacion = calcularPuntuacion(score.movimientos, score.tiempo, score.dificultad);
      
      await prisma.gameScore.create({
        data: {
          userName: score.userName,
          game: "Memoria",
          score: puntuacion,
          userId: null, // Usuario anónimo
        },
      });
    }

    // Crear puntuaciones de crucigrama
    for (const score of crosswordScores) {
      const puntuacion = calcularPuntuacion(score.palabrasCompletadas, score.tiempo, score.dificultad);
      
      await prisma.gameScore.create({
        data: {
          userName: score.userName,
          game: "Crucigrama",
          score: puntuacion,
          userId: null, // Usuario anónimo
        },
      });
    }

    console.log('✅ Puntuaciones de prueba agregadas exitosamente!');
    console.log(`📊 Se agregaron ${memoryScores.length} puntuaciones de Memoria`);
    console.log(`📊 Se agregaron ${crosswordScores.length} puntuaciones de Crucigrama`);
    console.log(`🎯 Entorno: ${currentEnv.toUpperCase()}`);

  } catch (error) {
    console.error('❌ Error al agregar puntuaciones de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
seedScores(); 