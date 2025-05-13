import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      if (req && "user" in req) {
        req.user = decoded;
      }
    } catch (_) {
      // Silenciar error, no interrumpimos el flujo
    }
  }

  return next();
};
