import { PrismaClient } from '@prisma/client';
import { getConfig } from '../config/environments';

// Configuración dinámica de Prisma según el entorno
const config = getConfig();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url,
    },
  },
});

// Middleware para logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`🔍 Query ${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });
}

export { prisma };
