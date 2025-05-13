import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (req && "user" in req) {
      req.user = decoded;
    }
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
