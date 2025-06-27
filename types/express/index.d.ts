import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId?: string;
      // Puedes agregar aquí más propiedades si tu usuario tiene más datos
      [key: string]: any;
    };
  }
} 