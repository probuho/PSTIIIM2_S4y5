/**
 * CONFIGURACIÓN DE ENTORNOS - Sistema Multi-Ambiente
 * 
 * Este archivo maneja la configuración para diferentes entornos:
 * - development: Local development
 * - staging: QA/Testing environment  
 * - production: Production environment
 */

export type Environment = 'development' | 'staging' | 'production';

// Detectar el entorno actual
export const getCurrentEnvironment = (): Environment => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  return 'development';
};

// Configuraciones por entorno
export const environments = {
  development: {
    database: {
      url: "mongodb://localhost:27017/explorador-planetario",
      name: "explorador-planetario"
    },
    server: {
      port: 3000,
      host: "localhost"
    },
    frontend: {
      url: "http://localhost:5173"
    },
    jwt: {
      secret: "tu_jwt_secret_super_seguro_aqui_2024",
      refreshSecret: "tu_jwt_refresh_secret_super_seguro_aqui_2024"
    },
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:4000"]
    }
  },
  
  staging: {
    database: {
      url: "mongodb+srv://probuho:MiBaseDeDatos42@gepddb.jz5tljo.mongodb.net/explorador-planetario-staging",
      name: "explorador-planetario-staging"
    },
    server: {
      port: process.env.PORT || 10000,
      host: "0.0.0.0"
    },
    frontend: {
      url: process.env.FRONTEND_URL || "https://staging-explorador-planetario.vercel.app"
    },
    jwt: {
      secret: process.env.JWT_SECRET || "staging_secret_key_2024",
      refreshSecret: process.env.JWT_REFRESH_SECRET || "staging_refresh_secret_2024"
    },
    cors: {
      origin: [process.env.FRONTEND_URL || "https://staging-explorador-planetario.vercel.app"]
    }
  },
  
  production: {
    database: {
      url: "mongodb+srv://probuho:MiBaseDeDatos42@gepddb.jz5tljo.mongodb.net/explorador-planetario",
      name: "explorador-planetario"
    },
    server: {
      port: process.env.PORT || 10000,
      host: "0.0.0.0"
    },
    frontend: {
      url: process.env.FRONTEND_URL || "https://explorador-planetario.vercel.app"
    },
    jwt: {
      secret: process.env.JWT_SECRET || "mi_secreto_super_seguro_2024",
      refreshSecret: process.env.JWT_REFRESH_SECRET || "mi_refresh_secreto_super_seguro_2024"
    },
    cors: {
      origin: [process.env.FRONTEND_URL || "https://explorador-planetario.vercel.app"]
    }
  }
};

// Obtener configuración del entorno actual
export const getConfig = () => {
  const currentEnv = getCurrentEnvironment();
  return environments[currentEnv];
};

// Función para validar configuración
export const validateConfig = () => {
  const config = getConfig();
  const currentEnv = getCurrentEnvironment();
  
  console.log(`🚀 Iniciando en entorno: ${currentEnv.toUpperCase()}`);
  console.log(`📊 Base de datos: ${config.database.name}`);
  console.log(`🌐 Frontend URL: ${config.frontend.url}`);
  console.log(`🔧 Puerto: ${config.server.port}`);
  
  // Validaciones críticas
  if (!config.database.url) {
    throw new Error(`❌ DATABASE_URL no configurada para entorno ${currentEnv}`);
  }
  
  if (!config.jwt.secret) {
    throw new Error(`❌ JWT_SECRET no configurada para entorno ${currentEnv}`);
  }
  
  console.log(`✅ Configuración validada para entorno ${currentEnv}`);
  return config;
}; 