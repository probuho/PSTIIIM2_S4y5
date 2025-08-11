import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Poblando base de datos con datos de prueba...');

  try {
    // Limpiar base de datos existente
    console.log('🧹 Limpiando base de datos existente...');
    await prisma.gameScore.deleteMany();
    await prisma.species.deleteMany();
    await prisma.preferenciasUsuario.deleteMany();
    await prisma.actividad.deleteMany();
    await prisma.guardado.deleteMany();
    await prisma.respuesta.deleteMany();
    await prisma.tema.deleteMany();
    await prisma.comunidadUsuario.deleteMany();
    await prisma.usuarioLogro.deleteMany();
    await prisma.logro.deleteMany();
    await prisma.comunidad.deleteMany();
    await prisma.tarea.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.twoFactorToken.deleteMany();
    await prisma.twoFactorConfirmation.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Base de datos limpiada');

    // Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@gep.com',
        name: 'Administrador GEP',
        nickname: 'AdminGEP',
        password: '$2b$10$dummy.hash.for.testing', // Hash dummy
        nivel: 10,
        puntos: 1000,
        avatarUrl: '/avatars/admin.png',
        status: 'A',
      },
    });

    console.log('✅ Usuario administrador creado:', adminUser.nickname);

    // Crear logros
    console.log('🏆 Creando logros...');
    const logros = [
      {
        nombre: 'Primer Paso',
        descripcion: 'Completa tu primer juego',
        nivel: 1,
        icono: '🎯',
      },
      {
        nombre: 'Explorador Novato',
        descripcion: 'Descubre 5 especies',
        nivel: 2,
        icono: '🔍',
      },
      {
        nombre: 'Maestro del Memoria',
        descripcion: 'Obtén 1000 puntos en memoria',
        nivel: 3,
        icono: '🧠',
      },
      {
        nombre: 'Comunidad Activa',
        descripcion: 'Participa en 3 temas',
        nivel: 4,
        icono: '👥',
      },
      {
        nombre: 'Conservacionista',
        descripcion: 'Aprende sobre 10 especies en peligro',
        nivel: 5,
        icono: '🌱',
      },
    ];

    for (const logroData of logros) {
      await prisma.logro.create({
        data: logroData,
      });
    }

    console.log('✅ Logros creados');

    // Crear tareas
    console.log('📋 Creando tareas...');
    const tareas = [
      {
        descripcion: 'Completa el tutorial del juego de memoria',
        dificultad: 20,
        modulo: 'Juegos',
      },
      {
        descripcion: 'Resuelve 3 crucigramas',
        dificultad: 40,
        modulo: 'Juegos',
      },
      {
        descripcion: 'Identifica 5 especies diferentes',
        dificultad: 30,
        modulo: 'Especies',
      },
      {
        descripcion: 'Participa en una discusión de la comunidad',
        dificultad: 25,
        modulo: 'Comunidad',
      },
      {
        descripcion: 'Obtén 500 puntos en cualquier juego',
        dificultad: 50,
        modulo: 'Juegos',
      },
    ];

    for (const tareaData of tareas) {
      await prisma.tarea.create({
        data: tareaData,
      });
    }

    console.log('✅ Tareas creadas');

    // Crear comunidades
    console.log('👥 Creando comunidades...');
    const comunidades = [
      {
        nombre: 'Conservación Marina',
        descripcion: 'Discusiones sobre la protección de especies marinas',
      },
      {
        nombre: 'Aves Urbanas',
        descripcion: 'Observación y conservación de aves en entornos urbanos',
      },
      {
        nombre: 'Biodiversidad Local',
        descripcion: 'Exploración de la biodiversidad en tu región',
      },
      {
        nombre: 'Juegos Educativos',
        descripcion: 'Comparte estrategias y puntuaciones de los juegos',
      },
    ];

    for (const comunidadData of comunidades) {
      await prisma.comunidad.create({
        data: comunidadData,
      });
    }

    console.log('✅ Comunidades creadas');

    // Crear especies
    console.log('🦋 Creando especies...');
    const especies = [
      {
        nombre: 'Mariposa Monarca',
        nombreCientifico: 'Danaus plexippus',
        categoria: 'Insectos',
        estadoConservacion: 'Vulnerable',
        habitat: 'Bosques templados y tropicales',
        descripcion: 'Famosa por su migración anual de miles de kilómetros',
        caracteristicas: ['Alas naranjas con venas negras', 'Migración masiva', 'Toxicidad para depredadores'],
        imagenUrl: '/especies/mariposa-monarca.jpg',
        distribucion: 'América del Norte y Central',
        alimentacion: 'Néctar de flores y algodoncillo',
        reproduccion: 'Huevos en plantas hospederas',
        amenazas: ['Pérdida de hábitat', 'Cambio climático', 'Uso de pesticidas'],
        medidasConservacion: ['Protección de hábitats', 'Plantación de algodoncillo', 'Reducción de pesticidas'],
        curiosidades: ['Pueden volar hasta 4,800 km', 'Viven hasta 8 meses', 'Se orientan por el sol'],
        nivelAmenaza: 3,
        poblacionEstimada: 'Millones de individuos',
      },
      {
        nombre: 'Jaguar',
        nombreCientifico: 'Panthera onca',
        categoria: 'Mamíferos',
        estadoConservacion: 'Casi amenazado',
        habitat: 'Selvas tropicales y bosques',
        descripcion: 'El felino más grande de América y el tercero del mundo',
        caracteristicas: ['Manchas en forma de rosetas', 'Mandíbula poderosa', 'Excelente nadador'],
        imagenUrl: '/especies/jaguar.jpg',
        distribucion: 'América del Sur y Central',
        alimentacion: 'Carnívoro, caza presas grandes',
        reproduccion: 'Gestación de 90-110 días',
        amenazas: ['Caza furtiva', 'Pérdida de hábitat', 'Conflicto con humanos'],
        medidasConservacion: ['Áreas protegidas', 'Programas de conservación', 'Educación comunitaria'],
        curiosidades: ['Puede cazar en el agua', 'Muerde más fuerte que un león', 'Territorial'],
        nivelAmenaza: 2,
        poblacionEstimada: '173,000 individuos',
      },
      {
        nombre: 'Quetzal',
        nombreCientifico: 'Pharomachrus mocinno',
        categoria: 'Aves',
        estadoConservacion: 'Casi amenazado',
        habitat: 'Bosques nubosos de montaña',
        descripcion: 'Ave sagrada para las culturas mesoamericanas',
        caracteristicas: ['Cola larga y colorida', 'Plumas iridiscentes', 'Canto melodioso'],
        imagenUrl: '/especies/quetzal.jpg',
        distribucion: 'Centroamérica',
        alimentacion: 'Frutas, insectos y pequeños vertebrados',
        reproduccion: 'Anida en árboles huecos',
        amenazas: ['Deforestación', 'Captura para el comercio', 'Cambio climático'],
        medidasConservacion: ['Reservas naturales', 'Reforestación', 'Control del comercio'],
        curiosidades: ['Símbolo nacional de Guatemala', 'No puede vivir en cautiverio', 'Plumas usadas en ceremonias'],
        nivelAmenaza: 2,
        poblacionEstimada: '20,000-50,000 individuos',
      },
      {
        nombre: 'Tortuga Marina Verde',
        nombreCientifico: 'Chelonia mydas',
        categoria: 'Reptiles',
        estadoConservacion: 'En peligro',
        habitat: 'Aguas costeras y océanos tropicales',
        descripcion: 'Una de las tortugas marinas más grandes del mundo',
        caracteristicas: ['Caparazón verde oliva', 'Nadadora migratoria', 'Herbívora adulta'],
        imagenUrl: '/especies/tortuga-verde.jpg',
        distribucion: 'Océanos tropicales y subtropicales',
        alimentacion: 'Algas marinas y pastos marinos',
        reproduccion: 'Desova en playas tropicales',
        amenazas: ['Captura incidental', 'Contaminación marina', 'Destrucción de playas'],
        medidasConservacion: ['Redes de pesca seguras', 'Protección de playas', 'Reducción de plásticos'],
        curiosidades: ['Puede vivir más de 80 años', 'Migra miles de kilómetros', 'Temperatura determina el sexo'],
        nivelAmenaza: 4,
        poblacionEstimada: '85,000-90,000 hembras anidadoras',
      },
      {
        nombre: 'Orquídea Fantasma',
        nombreCientifico: 'Dendrophylax lindenii',
        categoria: 'Plantas',
        estadoConservacion: 'En peligro',
        habitat: 'Bosques húmedos y pantanosos',
        descripcion: 'Orquídea epífita que parece flotar en el aire',
        caracteristicas: ['Sin hojas visibles', 'Raíces fotosintéticas', 'Flores blancas fragantes'],
        imagenUrl: '/especies/orquidea-fantasma.jpg',
        distribucion: 'Florida, Cuba y Bahamas',
        alimentacion: 'Fotosíntesis y nutrientes del aire',
        reproduccion: 'Polinización por polillas nocturnas',
        amenazas: ['Drenaje de humedales', 'Desarrollo urbano', 'Cambio climático'],
        medidasConservacion: ['Protección de humedales', 'Reforestación', 'Monitoreo de poblaciones'],
        curiosidades: ['Solo florece por la noche', 'Puede vivir más de 20 años', 'Muy rara en la naturaleza'],
        nivelAmenaza: 4,
        poblacionEstimada: 'Menos de 2,000 individuos',
      },
    ];

    for (const especieData of especies) {
      await prisma.species.create({
        data: especieData,
      });
    }

    console.log('✅ Especies creadas');

    // Crear puntuaciones de juegos
    console.log('🎮 Creando puntuaciones de juegos...');
    const gameScores = [
      // Scores de memoria
      {
        userId: adminUser.id,
        userName: adminUser.nickname,
        game: 'memory',
        score: 850,
        movimientos: 15,
        tiempo: 120,
        dificultad: 'facil',
      },
      {
        userId: adminUser.id,
        userName: adminUser.nickname,
        game: 'memory',
        score: 720,
        movimientos: 22,
        tiempo: 180,
        dificultad: 'medio',
      },
      {
        userId: adminUser.id,
        userName: adminUser.nickname,
        game: 'memory',
        score: 650,
        movimientos: 25,
        tiempo: 200,
        dificultad: 'dificil',
      },
      // Scores de crucigrama
      {
        userId: adminUser.id,
        userName: adminUser.nickname,
        game: 'crossword',
        score: 920,
        palabrasCompletadas: 8,
        tiempo: 300,
        dificultad: 'facil',
      },
      {
        userId: adminUser.id,
        userName: adminUser.nickname,
        game: 'crossword',
        score: 780,
        palabrasCompletadas: 12,
        tiempo: 450,
        dificultad: 'medio',
      },
      // Scores anónimos
      {
        userId: null,
        userName: 'Anónimo',
        game: 'memory',
        score: 680,
        movimientos: 20,
        tiempo: 160,
        dificultad: 'medio',
      },
      {
        userId: null,
        userName: 'Jugador Invitado',
        game: 'crossword',
        score: 650,
        palabrasCompletadas: 6,
        tiempo: 400,
        dificultad: 'facil',
      },
    ];

    for (const scoreData of gameScores) {
      await prisma.gameScore.create({
        data: scoreData,
      });
    }

    console.log('✅ Puntuaciones de juegos creadas');

    // Generar puntuaciones adicionales para todos los juegos
    console.log('🎲 Generando puntuaciones adicionales para todos los juegos...');
    
    const difficulties = ['facil', 'medio', 'dificil'];
    
    // Función para generar puntuaciones aleatorias
    const generateRandomScore = (difficulty: string) => {
      switch (difficulty) {
        case 'facil': return Math.floor(Math.random() * 300) + 700; // 700-999
        case 'medio': return Math.floor(Math.random() * 400) + 500; // 500-899
        case 'dificil': return Math.floor(Math.random() * 300) + 200; // 200-499
        default: return Math.floor(Math.random() * 500) + 300;
      }
    };

    // Función para generar tiempo aleatorio
    const generateRandomTime = (difficulty: string) => {
      switch (difficulty) {
        case 'facil': return Math.floor(Math.random() * 120) + 60; // 1-3 minutos
        case 'medio': return Math.floor(Math.random() * 180) + 120; // 2-5 minutos
        case 'dificil': return Math.floor(Math.random() * 240) + 180; // 3-7 minutos
        default: return Math.floor(Math.random() * 180) + 120;
      }
    };

    // Función para generar fecha aleatoria en los últimos 30 días
    const generateRandomDate = () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
    };

    // Generar 50 puntuaciones para Memory
    const memoryScores = [];
    for (let i = 0; i < 50; i++) {
      const userName = `Jugador${i + 1}`;
      const userId = Math.random() > 0.3 ? `user-${i}` : null;
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const score = generateRandomScore(difficulty);
      const tiempo = generateRandomTime(difficulty);
      const movimientos = Math.floor(Math.random() * 30) + 10; // 10-40 movimientos
      const date = generateRandomDate();

      memoryScores.push({
        userId: Math.random() > 0.3 ? `user-${i}` : null,
        userName,
        game: 'memory',
        movimientos,
        score,
        tiempo,
        dificultad: difficulty,
        date,
      });
    }

    // Generar 50 puntuaciones para Crossword
    const crosswordScores = [];
    for (let i = 0; i < 50; i++) {
      const userName = `Jugador${i + 1}`;
      const userId = Math.random() > 0.3 ? `user-${i}` : null;
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const score = generateRandomScore(difficulty);
      const tiempo = generateRandomTime(difficulty);
      const palabrasCompletadas = Math.floor(Math.random() * 15) + 5; // 5-20 palabras
      const date = generateRandomDate();

      crosswordScores.push({
        userId: Math.random() > 0.3 ? `user-${i}` : null,
        userName,
        game: 'crossword',
        palabrasCompletadas,
        score,
        tiempo,
        dificultad: difficulty,
        date,
      });
    }

    // Generar 50 puntuaciones para Quiz
    const quizScores = [];
    for (let i = 0; i < 50; i++) {
      const userName = `Jugador${i + 1}`;
      const userId = Math.random() > 0.3 ? `user-${i}` : null;
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const score = generateRandomScore(difficulty);
      const tiempo = generateRandomTime(difficulty);
      const movimientos = Math.floor(Math.random() * 20) + 5; // 5-25 preguntas
      const date = generateRandomDate();

      quizScores.push({
        userId: Math.random() > 0.3 ? `user-${i}` : null,
        userName,
        game: 'quiz',
        movimientos, // Usamos movimientos para representar preguntas respondidas
        score,
        tiempo,
        dificultad: difficulty,
        date,
      });
    }

    // Generar 50 puntuaciones para Guess
    const guessScores = [];
    for (let i = 0; i < 50; i++) {
      const userName = `Jugador${i + 1}`;
      const userId = Math.random() > 0.3 ? `user-${i}` : null;
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const score = generateRandomScore(difficulty);
      const tiempo = generateRandomTime(difficulty);
      const movimientos = Math.floor(Math.random() * 15) + 3; // 3-18 intentos
      const date = generateRandomDate();

      guessScores.push({
        userId: Math.random() > 0.3 ? `user-${i}` : null,
        userName,
        game: 'guess',
        movimientos, // Usamos movimientos para representar intentos
        score,
        tiempo,
        dificultad: difficulty,
        date,
      });
    }

    // Generar 50 puntuaciones para Hangman (Ahorcado)
    const hangmanScores = [];
    for (let i = 0; i < 50; i++) {
      const userName = `Jugador${i + 1}`;
      const userId = Math.random() > 0.3 ? `user-${i}` : null;
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const score = generateRandomScore(difficulty);
      const tiempo = generateRandomTime(difficulty);
      const movimientos = Math.floor(Math.random() * 12) + 2; // 2-14 intentos (letras adivinadas)
      const date = generateRandomDate();

      hangmanScores.push({
        userId: Math.random() > 0.3 ? `user-${i}` : null,
        userName,
        game: 'hangman',
        movimientos, // Usamos movimientos para representar letras adivinadas
        score,
        tiempo,
        dificultad: difficulty,
        date,
      });
    }

    // Crear todas las puntuaciones en la base de datos
    const allScores = [...memoryScores, ...crosswordScores, ...quizScores, ...guessScores, ...hangmanScores];
    
    for (const scoreData of allScores) {
      await prisma.gameScore.create({
        data: scoreData,
      });
    }

    console.log('✅ Puntuaciones adicionales generadas:');
    console.log(`   - Memory: ${memoryScores.length} registros`);
    console.log(`   - Crossword: ${crosswordScores.length} registros`);
    console.log(`   - Quiz: ${quizScores.length} registros`);
    console.log(`   - Guess: ${guessScores.length} registros`);

    // Crear temas de comunidad
    console.log('💬 Creando temas de comunidad...');
    const temas = [
      {
        titulo: '¿Cómo podemos proteger a las mariposas monarca?',
        contenido: 'Las mariposas monarca están en peligro. ¿Qué acciones podemos tomar en nuestra comunidad para ayudarlas?',
        autorId: adminUser.id,
        comunidadId: (await prisma.comunidad.findFirst({ where: { nombre: 'Conservación Marina' } }))!.id,
        likes: 5,
      },
      {
        titulo: 'Mejores estrategias para el juego de memoria',
        contenido: 'Compartan sus técnicas para obtener puntuaciones altas en el juego de memoria. ¡Quiero mejorar mi récord!',
        autorId: adminUser.id,
        comunidadId: (await prisma.comunidad.findFirst({ where: { nombre: 'Juegos Educativos' } }))!.id,
        likes: 8,
      },
      {
        titulo: 'Especies en peligro en mi región',
        contenido: 'Vivo en [región] y he notado que algunas especies están desapareciendo. ¿Alguien más ha observado esto?',
        autorId: adminUser.id,
        comunidadId: (await prisma.comunidad.findFirst({ where: { nombre: 'Biodiversidad Local' } }))!.id,
        likes: 3,
      },
    ];

    for (const temaData of temas) {
      await prisma.tema.create({
        data: temaData,
      });
    }

    console.log('✅ Temas de comunidad creados');

    // Crear respuestas
    console.log('💭 Creando respuestas...');
    const respuestas = [
      {
        contenido: 'En mi jardín planté algodoncillo y ahora veo muchas más mariposas. ¡Es increíble la diferencia que hace!',
        autorId: adminUser.id,
        temaId: (await prisma.tema.findFirst({ where: { titulo: '¿Cómo podemos proteger a las mariposas monarca?' } }))!.id,
      },
      {
        contenido: 'Para el juego de memoria, recomiendo empezar por las esquinas y trabajar hacia el centro. ¡Me ayudó mucho!',
        autorId: adminUser.id,
        temaId: (await prisma.tema.findFirst({ where: { titulo: 'Mejores estrategias para el juego de memoria' } }))!.id,
      },
    ];

    for (const respuestaData of respuestas) {
      await prisma.respuesta.create({
        data: respuestaData,
      });
    }

    console.log('✅ Respuestas creadas');

    // Crear preferencias del usuario
    console.log('⚙️ Creando preferencias del usuario...');
    await prisma.preferenciasUsuario.create({
      data: {
        userId: adminUser.id,
        mostrarLogros: true,
        notificaciones: true,
        idioma: 'es',
      },
    });

    console.log('✅ Preferencias del usuario creadas');

    // Crear logros del usuario
    console.log('🏆 Asignando logros al usuario...');
    const logrosDisponibles = await prisma.logro.findMany();
    for (const logro of logrosDisponibles.slice(0, 3)) { // Asignar los primeros 3 logros
      await prisma.usuarioLogro.create({
        data: {
          userId: adminUser.id,
          logroId: logro.id,
          progreso: Math.floor(Math.random() * 100),
          mostrarAlPublico: true,
        },
      });
    }

    console.log('✅ Logros del usuario asignados');

    // Crear membresía en comunidades
    console.log('👥 Agregando usuario a comunidades...');
    const comunidadesDisponibles = await prisma.comunidad.findMany();
    for (const comunidad of comunidadesDisponibles) {
      await prisma.comunidadUsuario.create({
        data: {
          userId: adminUser.id,
          comunidadId: comunidad.id,
          rol: 'Admin',
        },
      });
    }

    console.log('✅ Usuario agregado a comunidades');

    console.log('🎉 ¡Base de datos poblada exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - Usuarios: 1`);
    console.log(`   - Especies: ${especies.length}`);
    console.log(`   - Logros: ${logros.length}`);
    console.log(`   - Tareas: ${tareas.length}`);
    console.log(`   - Comunidades: ${comunidades.length}`);
    console.log(`   - Puntuaciones de juegos: ${gameScores.length}`);
    console.log(`   - Temas: ${temas.length}`);
    console.log(`   - Respuestas: ${respuestas.length}`);

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
