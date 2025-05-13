import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

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
      console.log(error);
      res.status(500).json({ error: "Error al registrar usuario" });
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
          nombre: user.name,
          nickname: user.nickname,
          email: user.email,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error al iniciar sesión" });
    }
  }
}

export default new UserController();
