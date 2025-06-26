import fs from "fs";
import path from "path";

const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const generalLogPath = path.join(logsDir, "general.log");

export function logGeneral(message: string, type: "INFO" | "ERROR" | "WARN" = "INFO") {
  const logLine = `[${new Date().toISOString()}] [${type}] ${message}\n`;
  fs.appendFileSync(generalLogPath, logLine);
} 