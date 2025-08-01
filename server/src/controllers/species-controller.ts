import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { 
  createSpeciesSchema, 
  updateSpeciesSchema, 
  searchSpeciesSchema,
  getSpeciesByIdSchema,
  CreateSpeciesInput,
  UpdateSpeciesInput,
  SearchSpeciesInput
} from "../lib/validations/species";

const prisma = new PrismaClient();

export class SpeciesController {
  // Obtener todas las especies con paginación
  static async getAllSpecies(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, categoria, estadoConservacion } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const where: any = { isActive: true };
      if (categoria && categoria !== "Todos") {
        where.categoria = categoria;
      }
      if (estadoConservacion && estadoConservacion !== "Todos") {
        where.estadoConservacion = estadoConservacion;
      }
      const [species, total] = await Promise.all([
        prisma.species.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { nombre: 'asc' },
          select: {
            id: true,
            nombre: true,
            nombreCientifico: true,
            categoria: true,
            estadoConservacion: true,
            habitat: true,
            imagenUrl: true,
            nivelAmenaza: true,
            createdAt: true,
          }
        }),
        prisma.species.count({ where })
      ]);
      const totalPages = Math.ceil(total / Number(limit));
      res.json({
        success: true,
        data: species,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      });
      return;
    } catch (error) {
      console.error("Error getting species:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
      return;
    }
  }

  // Obtener una especie por ID
  static async getSpeciesById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validation = getSpeciesByIdSchema.safeParse({ id });
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "ID inválido",
          errors: validation.error.issues
        });
        return;
      }
      const species = await prisma.species.findUnique({
        where: { id, isActive: true }
      });
      if (!species) {
        res.status(404).json({
          success: false,
          message: "Especie no encontrada"
        });
        return;
      }
      res.json({
        success: true,
        data: species
      });
      return;
    } catch (error) {
      console.error("Error getting species by ID:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
      return;
    }
  }

  // Buscar especies
  static async searchSpecies(req: Request, res: Response) {
    try {
      const validation = searchSpeciesSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Parámetros de búsqueda inválidos",
          errors: validation.error.issues
        });
        return;
      }
      const { query, categoria, estadoConservacion, limit, page } = validation.data;
      const skip = (page - 1) * limit;
      const where: any = {
        isActive: true,
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { nombreCientifico: { contains: query, mode: 'insensitive' } },
          { habitat: { contains: query, mode: 'insensitive' } },
          { descripcion: { contains: query, mode: 'insensitive' } }
        ]
      };
      if (categoria && categoria !== "Todos") {
        where.categoria = categoria;
      }
      if (estadoConservacion && estadoConservacion !== "Todos") {
        where.estadoConservacion = estadoConservacion;
      }
      const [species, total] = await Promise.all([
        prisma.species.findMany({
          where,
          skip,
          take: limit,
          orderBy: { nombre: 'asc' },
          select: {
            id: true,
            nombre: true,
            nombreCientifico: true,
            categoria: true,
            estadoConservacion: true,
            habitat: true,
            imagenUrl: true,
            nivelAmenaza: true,
          }
        }),
        prisma.species.count({ where })
      ]);
      const totalPages = Math.ceil(total / limit);
      res.json({
        success: true,
        data: species,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
      return;
    } catch (error) {
      console.error("Error searching species:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
      return;
    }
  }

  // Crear una nueva especie
  static async createSpecies(req: Request, res: Response) {
    try {
      const validation = createSpeciesSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Datos inválidos",
          errors: validation.error.issues
        });
        return;
      }
      const speciesData: CreateSpeciesInput = validation.data;
      const species = await prisma.species.create({
        data: speciesData
      });
      res.status(201).json({
        success: true,
        message: "Especie creada exitosamente",
        data: species
      });
      return;
    } catch (error) {
      console.error("Error creating species:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
      return;
    }
  }

  // Actualizar una especie
  static async updateSpecies(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body, id };
      const validation = updateSpeciesSchema.safeParse(updateData);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Datos inválidos",
          errors: validation.error.issues
        });
        return;
      }
      const { id: speciesId, ...dataToUpdate } = validation.data;
      const existingSpecies = await prisma.species.findUnique({
        where: { id: speciesId, isActive: true }
      });
      if (!existingSpecies) {
        res.status(404).json({
          success: false,
          message: "Especie no encontrada"
        });
        return;
      }
      const updatedSpecies = await prisma.species.update({
        where: { id: speciesId },
        data: dataToUpdate
      });
      res.json({
        success: true,
        message: "Especie actualizada exitosamente",
        data: updatedSpecies
      });
      return;
    } catch (error) {
      console.error("Error updating species:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
      return;
    }
  }

  // Eliminar una especie (soft delete)
  static async deleteSpecies(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validation = getSpeciesByIdSchema.safeParse({ id });
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "ID inválido",
          errors: validation.error.issues
        });
        return;
      }
      const existingSpecies = await prisma.species.findUnique({
        where: { id, isActive: true }
      });
      if (!existingSpecies) {
        res.status(404).json({
          success: false,
          message: "Especie no encontrada"
        });
        return;
      }
      await prisma.species.update({
        where: { id },
        data: { isActive: false }
      });
      res.json({
        success: true,
        message: "Especie eliminada exitosamente"
      });
      return;
    } catch (error) {
      console.error("Error deleting species:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
      return;
    }
  }

  // Obtener especies destacadas
  static async getFeaturedSpecies(req: Request, res: Response) {
    try {
      const featuredSpecies = await prisma.species.findMany({
        where: { 
          isActive: true,
          OR: [
            { nivelAmenaza: { gte: 4 } }, // Especies en peligro crítico o en peligro
            { estadoConservacion: { in: ["En peligro crítico", "En peligro"] } }
          ]
        },
        take: 6,
        orderBy: { nivelAmenaza: 'desc' },
        select: {
          id: true,
          nombre: true,
          nombreCientifico: true,
          categoria: true,
          estadoConservacion: true,
          imagenUrl: true,
          nivelAmenaza: true,
        }
      });
      res.json({
        success: true,
        data: featuredSpecies
      });
      return;
    } catch (error) {
      console.error("Error getting featured species:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
      return;
    }
  }
} 