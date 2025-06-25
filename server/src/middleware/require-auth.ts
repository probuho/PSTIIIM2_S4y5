import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { logGeneral } from "../lib/logger";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  logGeneral(`[DEBUG] requireAuth: Authorization header: ${authHeader}`);

  if (!token) {
    logGeneral("[ERROR] requireAuth: Token no proporcionado", "ERROR");
    res.status(401).json({ error: "Token no proporcionado" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    logGeneral(`[DEBUG] requireAuth: Token decodificado: ${JSON.stringify(decoded)}`);
    // Forzar la propiedad user en req (TypeScript workaround)
    (req as any).user = decoded;
    return next();
  } catch (error: any) {
    logGeneral(`[ERROR] requireAuth: Token inválido o expirado: ${error.message}`, "ERROR");
    res.status(401).json({ error: "Token inválido o expirado" });
    return;
  }
};
