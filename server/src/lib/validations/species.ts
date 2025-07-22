import { z } from "zod";

// Esquema de validación para crear una especie
export const createSpeciesSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  nombreCientifico: z.string().min(2, "El nombre científico debe tener al menos 2 caracteres").max(100),
  categoria: z.enum(["Mamíferos", "Aves", "Reptiles", "Anfibios", "Peces", "Plantas"], {
    errorMap: () => ({ message: "Categoría debe ser una de las opciones válidas" })
  }),
  estadoConservacion: z.enum([
    "Extinto", 
    "En peligro crítico", 
    "En peligro", 
    "Vulnerable", 
    "Casi amenazado", 
    "Preocupación menor"
  ], {
    errorMap: () => ({ message: "Estado de conservación debe ser una de las opciones válidas" })
  }),
  habitat: z.string().min(10, "El hábitat debe tener al menos 10 caracteres").max(500),
  descripcion: z.string().min(50, "La descripción debe tener al menos 50 caracteres").max(2000),
  caracteristicas: z.array(z.string().min(5)).min(1, "Debe tener al menos una característica").max(10),
  imagenUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  imagenCientifica: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  distribucion: z.string().min(10, "La distribución debe tener al menos 10 caracteres").max(500),
  alimentacion: z.string().min(10, "La alimentación debe tener al menos 10 caracteres").max(500),
  reproduccion: z.string().min(10, "La reproducción debe tener al menos 10 caracteres").max(500),
  amenazas: z.array(z.string().min(5)).min(1, "Debe tener al menos una amenaza").max(10),
  medidasConservacion: z.array(z.string().min(10)).min(1, "Debe tener al menos una medida de conservación").max(10),
  curiosidades: z.array(z.string().min(10)).min(1, "Debe tener al menos una curiosidad").max(10),
  fechaDescubrimiento: z.date().optional(),
  autorDescubrimiento: z.string().min(2).max(100).optional(),
  nivelAmenaza: z.number().int().min(1).max(5),
  poblacionEstimada: z.string().min(5).max(100).optional(),
});

// Esquema de validación para actualizar una especie
export const updateSpeciesSchema = createSpeciesSchema.partial().extend({
  id: z.string().min(1, "ID es requerido"),
});

// Esquema de validación para búsqueda de especies
export const searchSpeciesSchema = z.object({
  query: z.string().min(1, "La búsqueda no puede estar vacía").max(100),
  categoria: z.enum(["Todos", "Mamíferos", "Aves", "Reptiles", "Anfibios", "Peces", "Plantas"]).optional(),
  estadoConservacion: z.enum([
    "Todos",
    "Extinto", 
    "En peligro crítico", 
    "En peligro", 
    "Vulnerable", 
    "Casi amenazado", 
    "Preocupación menor"
  ]).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  page: z.number().int().min(1).default(1),
});

// Esquema de validación para obtener una especie por ID
export const getSpeciesByIdSchema = z.object({
  id: z.string().min(1, "ID es requerido"),
});

// Tipos TypeScript derivados de los esquemas
export type CreateSpeciesInput = z.infer<typeof createSpeciesSchema>;
export type UpdateSpeciesInput = z.infer<typeof updateSpeciesSchema>;
export type SearchSpeciesInput = z.infer<typeof searchSpeciesSchema>;
export type GetSpeciesByIdInput = z.infer<typeof getSpeciesByIdSchema>; 