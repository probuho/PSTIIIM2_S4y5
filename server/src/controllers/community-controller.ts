import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { logGeneral } from "../lib/logger";
import { logErrorToFile } from "../index";

export const getTemasComunidad = async (req: Request, res: Response) => {
  try {
    const temas = await prisma.tema.findMany({
      include: { autor: true, comunidad: true, respuestas: true }
    });
    res.status(200).json({ temas });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los temas" });
  }
};

export const crearTema = async (req: Request, res: Response) => {
  logGeneral("[DEBUG] Iniciando creación de tema", "INFO");
  try {
    const userId = (req as any).user?.userId;
    const { titulo, contenido, comunidadId } = req.body;
    logGeneral(`[DEBUG] Datos recibidos: userId=${userId}, titulo=${titulo}, contenido=${contenido}, comunidadId=${comunidadId}`);
    let comunidadIdFinal = comunidadId;
    if (!comunidadIdFinal) {
      logGeneral("[DEBUG] No se recibió comunidadId, buscando o creando comunidad por defecto");
      const comunidad = await prisma.comunidad.findFirst();
      if (comunidad) {
        comunidadIdFinal = comunidad.id;
        logGeneral(`[DEBUG] Se usará comunidad existente: ${comunidadIdFinal}`);
      } else {
        const nueva = await prisma.comunidad.create({
          data: { nombre: "General", descripcion: "Comunidad general" }
        });
        comunidadIdFinal = nueva.id;
        logGeneral(`[DEBUG] Se creó nueva comunidad: ${comunidadIdFinal}`);
      }
    }
    const tema = await prisma.tema.create({
      data: {
        titulo,
        contenido,
        autorId: userId,
        comunidadId: comunidadIdFinal,
      }
    });
    logGeneral(`[INFO] Tema creado correctamente: id=${tema.id}, titulo=${tema.titulo}, autor=${tema.autorId}`);
    res.status(201).json({ tema });
  } catch (error: any) {
    logGeneral(`[ERROR] Error al crear tema: ${error.message}`, "ERROR");
    logErrorToFile(`[ERROR] Error al crear tema: ${error.stack || error.message}`);
    res.status(500).json({ error: "Error al crear el tema" });
  }
};

export const responderTema = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { contenido } = req.body;
    const temaId = req.params.id;
    const respuesta = await prisma.respuesta.create({
      data: {
        contenido,
        autorId: userId,
        temaId,
      }
    });
    res.status(201).json({ respuesta });
  } catch (error) {
    res.status(500).json({ error: "Error al responder el tema" });
  }
};

export const votarTema = async (req: Request, res: Response) => {
  try {
    const temaId = req.params.id;
    await prisma.tema.update({
      where: { id: temaId },
      data: { likes: { increment: 1 } }
    });
    res.status(200).json({ message: "Voto registrado" });
  } catch (error) {
    res.status(500).json({ error: "Error al votar el tema" });
  }
}; 