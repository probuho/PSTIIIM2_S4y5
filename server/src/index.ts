import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import router from "./routes";
import fs from "fs";
import path from "path";
import { logGeneral } from "./lib/logger";

dotenv.config();

const { PORT } = process.env;

const app = express();
app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Crear stream para access.log
const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), { flags: "a" });

// Middleware de morgan para guardar logs de acceso
app.use(morgan("combined", { stream: accessLogStream }));

// Mostrar logs en consola también
app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(router);

// Log de inicio del servidor
logGeneral("Servidor iniciado", "INFO");

app.listen(Number(PORT) || 3001, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  logGeneral(`Servidor escuchando en puerto ${PORT}`, "INFO");
});

// Función para loguear errores personalizados
export function logErrorToFile(message: string) {
  const errorLogPath = path.join(logsDir, "error.log");
  fs.appendFileSync(errorLogPath, `[${new Date().toISOString()}] ${message}\n`);
}

// Captura errores globales
process.on("uncaughtException", (err) => {
  logGeneral(`Excepción no capturada: ${err.message}`, "ERROR");
});
process.on("unhandledRejection", (reason) => {
  logGeneral(`Promesa no manejada: ${reason}`, "ERROR");
});
