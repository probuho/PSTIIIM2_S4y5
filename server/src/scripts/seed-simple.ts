import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(' Poblando base de datos con datos de prueba...');

  try {
    // Limpiar base de datos existente
    console.log(' Limpiando base de datos existente...');
    await prisma.gameScore.deleteMany();
    await prisma.species.deleteMany();
    await prisma.user.deleteMany();
    await prisma.logro.deleteMany();
    await prisma.comunidad.deleteMany();
    await prisma.tema.deleteMany();
    await prisma.respuesta.deleteMany();
    await prisma.guardado.deleteMany();
    await prisma.actividad.deleteMany();
    await prisma.preferenciasUsuario.deleteMany();
    await prisma.usuarioLogro.deleteMany();
    await prisma.comunidadUsuario.deleteMany();
    await prisma.tarea.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.twoFactorToken.deleteMany();
    await prisma.twoFactorConfirmation.deleteMany();

    console.log(' Base de datos limpiada');

    // Crear usuario administrador
    console.log(' Creando usuario administrador...');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@gep.com',
        name: 'Administrador GEP',
        nickname: 'AdminGEP',
        password: '$2b$10$dummy.hash.for.testing',
        nivel: 10,
        puntos: 1000,
        avatarUrl: '/avatars/admin.png',
        status: 'A',
      },
    });

    console.log(' Usuario administrador creado:', adminUser.nickname);

    // Crear especies b�sicas
    console.log(' Creando especies...');
    const especies = [
      {
        nombre: 'Mariposa Monarca',
        nombreCientifico: 'Danaus plexippus',
        categoria: 'Insectos',
        estadoConservacion: 'Vulnerable',
        habitat: 'Bosques templados',
        descripcion: 'Famosa por su migraci�n anual',
        caracteristicas: ['Alas naranjas', 'Migraci�n masiva'],
        distribucion: 'Am�rica del Norte',
        alimentacion: 'N�ctar de flores',
        reproduccion: 'Huevos en plantas',
        amenazas: ['P�rdida de h�bitat'],
        medidasConservacion: ['Protecci�n de h�bitats'],
        curiosidades: ['Vuelan hasta 4,800 km'],
        nivelAmenaza: 3,
        poblacionEstimada: 'Millones',
      },
      {
        nombre: 'Jaguar',
        nombreCientifico: 'Panthera onca',
        categoria: 'Mam�feros',
        estadoConservacion: 'Casi amenazado',
        habitat: 'Selvas tropicales',
        descripcion: 'El felino m�s grande de Am�rica',
        caracteristicas: ['Manchas en forma de rosetas'],
        distribucion: 'Am�rica del Sur',
        alimentacion: 'Carn�voro',
        reproduccion: 'Gestaci�n de 90 d�as',
        amenazas: ['Caza furtiva'],
        medidasConservacion: ['�reas protegidas'],
        curiosidades: ['Puede cazar en el agua'],
        nivelAmenaza: 2,
        poblacionEstimada: '173,000',
      },
    ];

    for (const especieData of especies) {
      await prisma.species.create({
        data: especieData,
      });
    }

    console.log(' Especies creadas');

    // Crear puntuaciones de juegos
    console.log(' Creando puntuaciones de juegos...');
    const gameScores = [
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
        game: 'crossword',
        score: 920,
        palabrasCompletadas: 8,
        tiempo: 300,
        dificultad: 'facil',
      },
      {
        userId: null,
        userName: 'An�nimo',
        game: 'memory',
        score: 680,
        movimientos: 20,
        tiempo: 160,
        dificultad: 'medio',
      },
    ];

    for (const scoreData of gameScores) {
      await prisma.gameScore.create({
        data: scoreData,
      });
    }

    console.log(' Puntuaciones de juegos creadas');

    console.log(' �Base de datos poblada exitosamente!');
    console.log(` Resumen:`);
    console.log(`   - Usuarios: 1`);
    console.log(`   - Especies: ${especies.length}`);
    console.log(`   - Puntuaciones de juegos: ${gameScores.length}`);

  } catch (error) {
    console.error(' Error poblando la base de datos:', error);
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
