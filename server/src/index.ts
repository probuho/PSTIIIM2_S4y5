import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import router from "./routes";
import { validateConfig, getConfig } from "./config/environments";
import { ExpressAuth } from "@auth/express";
import authConfig from "./auth.config";

// Cargar variables de entorno
dotenv.config();

// Validar configuración del entorno
const config = validateConfig();

const app = express();

// Configuración de CORS dinámica según el entorno
const corsOptions = {
  origin: config.cors.origin,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors(corsOptions));
// AuthJS routes (no rompen las existentes). En Express 5 usar subapp sin comodín.
app.use("/auth", ExpressAuth(authConfig));
app.use("/api", router);

// Ruta de health check para Render
app.get("/", (req, res) => {
  res.json({ 
    message: "Explorador Planetario API is running!", 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Ruta para verificar configuración (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.get("/config", (req, res) => {
    res.json({
      environment: process.env.NODE_ENV,
      database: config.database.name,
      frontend: config.frontend.url,
      port: config.server.port
    });
  });
}

app.listen(Number(config.server.port), config.server.host, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${config.server.port}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Base de datos: ${config.database.name}`);
    console.log(`🔗 Frontend: ${config.frontend.url}`);
});

