import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token no proporcionado" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (typeof decoded === "object" && decoded !== null) {
      req.user = decoded as JwtPayload;
    } else {
      req.user = undefined;
    }
    return next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
    return;
  }
};
