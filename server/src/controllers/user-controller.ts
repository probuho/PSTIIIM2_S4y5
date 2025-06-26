import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { logGeneral } from "../lib/logger";

class UserController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, apellido, nickname, email, password } = req.body;

      const extEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (extEmail) {
        res.status(400).json({ error: "Email already exists" });
        return;
      }

      const extNickname = await prisma.user.findUnique({
        where: { nickname },
      });

      if (extNickname) {
        res.status(400).json({ error: "Nickname already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name: nombre + " " + apellido,
          nickname,
          email,
          password: hashedPassword,
        },
      });

      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );
      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        message: "Usuario registrado exitosamente",
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          nombre: user.name,
          nickname: user.nickname,
          email: user.email,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Undefined Error!";
      res.status(500).json({ error: message });
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        res.status(401).json({ error: "Usuario no encontrado" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ error: "Contraseña incorrecta" });
        return;
      }

      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );
      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          email: user.email,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Undefined Error!";
      res.status(500).json({ error: message });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const data = req.body;

      const existing = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existing) {
        res.status(401).json({ error: "User not found!" });
        return;
      }

      await prisma.user.update({
        where: { id: existing.id },
        data,
      });

      res.status(200).json({ message: "Usuario actualizado con exito!" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Undefined Error!";
      res.status(500).json({ error: message });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Token requerido" });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      res.status(200).json({ valid: true, decoded });
    } catch (error) {
      res.status(401).json({ valid: false, error: "Token inválido" });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    logGeneral("[DEBUG] Iniciando obtención de perfil", "INFO");
    try {
      const userId = req.user?.userId || (req as any).user?.userId;
      logGeneral(`[DEBUG] userId extraído del token: ${userId}`);
      if (!userId) {
        logGeneral("[ERROR] No se pudo extraer el userId del token", "ERROR");
        res.status(401).json({ error: "No autorizado" });
        return;
      }
      // Obtener datos básicos del usuario
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          logros: true, // Relación logros (ajusta según tu modelo)
          comunidades: true, // Relación comunidades (ajusta según tu modelo)
          aportes: true, // Relación aportes (ajusta según tu modelo)
          replicas: true, // Relación réplicas (ajusta según tu modelo)
          guardados: true, // Relación guardados (ajusta según tu modelo)
          actividad: true, // Relación actividad (ajusta según tu modelo)
          preferencias: true, // Relación preferencias (ajusta según tu modelo)
        },
      });
      if (!user) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }
      res.status(200).json({
        id: user.id,
        nombre: user.name,
        avatarUrl: user.avatarUrl,
        nivel: user.nivel,
        puntos: user.puntos,
        miembroDesde: user.createdAt,
        logros: user.logros,
        comunidades: user.comunidades,
        aportes: user.aportes,
        replicas: user.replicas,
        guardados: user.guardados,
        actividad: user.actividad,
        preferencias: user.preferencias,
      });
    } catch (error: any) {
      logGeneral(`[ERROR] Error al obtener perfil: ${error.message}`, "ERROR");
      res.status(500).json({ error: "Error al obtener el perfil" });
    }
  }

  async getRoadmap(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: "No autenticado" });
        return;
      }
      // Obtener todos los logros y tareas
      const logros = await prisma.logro.findMany({
        include: { tareas: true }
      });
      // Obtener progreso del usuario
      const usuarioLogros = await prisma.usuarioLogro.findMany({
        where: { userId },
      });
      // Mapear progreso
      const roadmap = logros.map(logro => {
        const userLogro = usuarioLogros.find(ul => ul.logroId === logro.id);
        return {
          ...logro,
          progreso: userLogro?.progreso || 0,
          completado: (userLogro?.progreso || 0) >= 100
        };
      });
      res.status(200).json({ roadmap });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el roadmap" });
    }
  }
}

export default new UserController();
