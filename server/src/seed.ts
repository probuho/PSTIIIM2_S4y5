import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Usuarios ficticios
  const users = [
    { name: 'Usuario Uno', nickname: 'usuario1', email: 'usuario1@demo.com', password: 'demo1234' },
    { name: 'Usuario Dos', nickname: 'usuario2', email: 'usuario2@demo.com', password: 'demo1234' },
    { name: 'Usuario Tres', nickname: 'usuario3', email: 'usuario3@demo.com', password: 'demo1234' },
  ];

  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        password: hashed,
        // Los campos con default no es necesario especificarlos
      },
    });
  }

  // Especies ficticias
  const species = [
    {
      nombre: 'Jaguar',
      nombreCientifico: 'Panthera onca',
      categoria: 'Mamíferos',
      estadoConservacion: 'En peligro',
      habitat: 'Selva tropical',
      descripcion: 'El jaguar es el felino más grande de América.',
      caracteristicas: ['Gran tamaño', 'Pelaje con manchas', 'Excelente nadador'],
      imagenUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      distribucion: 'América Central y del Sur',
      alimentacion: 'Carnívoro',
      reproduccion: 'Vivíparo, 1-4 crías',
      amenazas: ['Pérdida de hábitat', 'Caza furtiva'],
      medidasConservacion: ['Protección de hábitats', 'Leyes contra la caza'],
      curiosidades: ['Puede rugir', 'Nada largas distancias'],
      nivelAmenaza: 4,
      isActive: true,
    },
    {
      nombre: 'Guacamaya roja',
      nombreCientifico: 'Ara macao',
      categoria: 'Aves',
      estadoConservacion: 'Vulnerable',
      habitat: 'Selva y bosques húmedos',
      descripcion: 'Ave colorida de gran tamaño, símbolo de la selva.',
      caracteristicas: ['Plumaje rojo', 'Pico fuerte', 'Vuela en parejas'],
      imagenUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
      distribucion: 'América Central y del Sur',
      alimentacion: 'Frutas, semillas, nueces',
      reproduccion: 'Ovíparo, 2-4 huevos',
      amenazas: ['Tráfico ilegal', 'Pérdida de hábitat'],
      medidasConservacion: ['Programas de reproducción', 'Educación ambiental'],
      curiosidades: ['Viven más de 50 años', 'Forman parejas de por vida'],
      nivelAmenaza: 3,
      isActive: true,
    },
    {
      nombre: 'Ajolote',
      nombreCientifico: 'Ambystoma mexicanum',
      categoria: 'Anfibios',
      estadoConservacion: 'En peligro crítico',
      habitat: 'Lagos y canales de Xochimilco',
      descripcion: 'Anfibio endémico de México, famoso por su capacidad regenerativa.',
      caracteristicas: ['Branquias externas', 'Regeneración de extremidades'],
      imagenUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
      distribucion: 'Valle de México',
      alimentacion: 'Carnívoro, pequeños peces e insectos',
      reproduccion: 'Ovíparo, pone hasta 1000 huevos',
      amenazas: ['Contaminación', 'Especies invasoras'],
      medidasConservacion: ['Cría en cautiverio', 'Restauración de hábitats'],
      curiosidades: ['Puede regenerar órganos', 'Símbolo de la biología mexicana'],
      nivelAmenaza: 5,
      isActive: true,
    },
    {
      nombre: 'Oso hormiguero',
      nombreCientifico: 'Myrmecophaga tridactyla',
      categoria: 'Mamíferos',
      estadoConservacion: 'Vulnerable',
      habitat: 'Bosques y sabanas',
      descripcion: 'Mamífero especializado en alimentarse de hormigas y termitas.',
      caracteristicas: ['Hocico largo', 'Lengua pegajosa', 'Pelaje áspero'],
      imagenUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
      distribucion: 'América Central y del Sur',
      alimentacion: 'Hormigas y termitas',
      reproduccion: 'Vivíparo, una cría',
      amenazas: ['Incendios', 'Pérdida de hábitat'],
      medidasConservacion: ['Protección de áreas naturales'],
      curiosidades: ['No tiene dientes', 'Gran sentido del olfato'],
      nivelAmenaza: 3,
      isActive: true,
    },
    {
      nombre: 'Tortuga marina',
      nombreCientifico: 'Chelonia mydas',
      categoria: 'Reptiles',
      estadoConservacion: 'En peligro',
      habitat: 'Océanos tropicales y subtropicales',
      descripcion: 'Reptil marino que realiza largas migraciones.',
      caracteristicas: ['Caparazón grande', 'Nado prolongado'],
      imagenUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9',
      distribucion: 'Mares tropicales de todo el mundo',
      alimentacion: 'Algas y pastos marinos',
      reproduccion: 'Ovíparo, pone hasta 200 huevos',
      amenazas: ['Caza', 'Contaminación', 'Redes de pesca'],
      medidasConservacion: ['Protección de playas', 'Educación ambiental'],
      curiosidades: ['Regresan a la playa donde nacieron', 'Viven más de 80 años'],
      nivelAmenaza: 4,
      isActive: true,
    },
  ];

  for (const s of species) {
    const existing = await prisma.species.findFirst({ where: { nombre: s.nombre } });
    if (existing) {
      await prisma.species.update({ where: { id: existing.id }, data: s });
    } else {
      await prisma.species.create({ data: s });
    }
  }

  console.log('Datos ficticios insertados correctamente.');
  console.log('Credenciales de prueba:');
  users.forEach(u => {
    console.log(`Usuario: ${u.nickname} | Email: ${u.email} | Contraseña: ${u.password}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
