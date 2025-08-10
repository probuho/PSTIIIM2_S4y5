import React, { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import * as Select from "@radix-ui/react-select";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Search, Check, Plus, Filter, Eye } from "lucide-react";
import { getAnimalImage, getPlaceImage } from "@/lib/unsplash-config";

// Categorías y estados de conservación
const categories = [
  "Todos",
  "Mamíferos",
  "Aves",
  "Reptiles",
  "Anfibios",
  "Peces",
  "Plantas",
];

const conservationStatuses = [
  "Extinto",
  "En peligro crítico",
  "En peligro",
  "Vulnerable",
  "Casi amenazado",
  "Preocupación menor",
];

// Esquema básico para el formulario
const initialForm = {
  nombre: "",
  nombreCientifico: "",
  categoria: "Mamíferos",
  estadoConservacion: "Vulnerable",
  habitat: "",
  descripcion: "",
  imagenUrl: "",
};

export default function SpeciesPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("Todos");
  const [status, setStatus] = useState<string[]>([]);
  const [species, setSpecies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const { register, handleSubmit, reset } = useForm({ defaultValues: initialForm });

  // Obtener especies del backend
  const fetchSpecies = async (q = search) => {
    setLoading(true);
    setError("");
    try {
      let url = `${API_ENDPOINTS.SPECIES}?limit=100`;
      if (selected !== "Todos") url += `&categoria=${encodeURIComponent(selected)}`;
      if (status.length > 0) url += status.map(st => `&estadoConservacion=${encodeURIComponent(st)}`).join("");
      const res = await fetch(url);
      const data = await res.json();
      
      // Cargar imágenes dinámicas para especies que no tienen imagen
      const speciesWithImages = await Promise.all(
        (data.data || []).map(async (sp: any) => {
          if (!sp.imagenUrl) {
            try {
              const imageUrl = await getAnimalImage(sp.nombre);
              return { ...sp, imagenUrl: imageUrl };
            } catch (error) {
              console.error(`Error al cargar imagen para ${sp.nombre}:`, error);
              return sp;
            }
          }
          return sp;
        })
      );
      
      setSpecies(speciesWithImages);
    } catch (err) {
      setError("No se pudieron cargar las especies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecies();
    // eslint-disable-next-line
  }, [selected, status]);

  // Filtrar por búsqueda local
  const filteredSpecies = species.filter(sp => {
    const q = search.toLowerCase();
    return (
      sp.nombre.toLowerCase().includes(q) ||
      sp.nombreCientifico.toLowerCase().includes(q) ||
      (sp.habitat && sp.habitat.toLowerCase().includes(q))
    );
  });

  // Manejar envío del formulario
  const onSubmit = async (data: any) => {
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");
    try {
      // Si no hay imagen URL, intentar obtener una de Unsplash
      if (!data.imagenUrl) {
        try {
          data.imagenUrl = await getAnimalImage(data.nombre);
        } catch (error) {
          console.error('Error al obtener imagen de Unsplash:', error);
        }
      }

      const res = await fetch(API_ENDPOINTS.SPECIES, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` 
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (res.ok) {
        setFormSuccess("Especie agregada exitosamente.");
        reset();
        fetchSpecies(); // Recargar lista
        setTimeout(() => setShowForm(false), 2000);
      } else {
        setFormError(result.error || "Error al agregar especie.");
      }
    } catch (err) {
      setFormError("Error de conexión.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchSpecies();
  };

  const handleStatusChange = (value: string) => {
    setStatus(prev => 
      prev.includes(value) 
        ? prev.filter(s => s !== value)
        : [...prev, value]
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "Extinto": "bg-gray-500",
      "En peligro crítico": "bg-red-600",
      "En peligro": "bg-orange-500",
      "Vulnerable": "bg-yellow-500",
      "Casi amenazado": "bg-blue-500",
      "Preocupación menor": "bg-green-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-400";
  };

  return (
    <div className="space-y-8">
      {/* Título y descripción */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          🦋 Catálogo de Especies
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explora nuestra base de datos de especies en peligro de extinción. 
          Descubre información detallada sobre su hábitat, estado de conservación y más.
        </p>
      </div>

      {/* Panel de búsqueda y filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="space-y-6">
          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar especies por nombre, científico o hábitat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                onKeyDown={e => { if (e.key === "Enter") handleSearch(e as any); }}
              />
            </div>
            <Button type="submit" variant="outline" className="px-6">
              Buscar
            </Button>
          </form>

          {/* Filtros */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categorías */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Categorías</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selected === cat ? "default" : "outline"}
                    onClick={() => setSelected(cat)}
                    className="rounded-full px-4 py-2 text-sm"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Estados de conservación */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Estado de Conservación</Label>
              <Select.Root
                onValueChange={value => handleStatusChange(value)}
                value={status.length === 1 ? status[0] : ""}
              >
                <Select.Trigger className="border rounded-lg p-3 min-w-[200px] bg-white">
                  <span className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {status.length > 0 ? status.join(", ") : "Seleccionar estado(s)"}
                  </span>
                </Select.Trigger>
                <Select.Content className="bg-white border rounded-lg shadow-lg z-50">
                  <Select.Group>
                    <Select.Label className="px-3 py-2 text-xs text-gray-500 font-semibold">
                      Estados de conservación
                    </Select.Label>
                    {conservationStatuses.map(st => (
                      <Select.Item key={st} value={st} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
                        <Checkbox.Root
                          checked={status.includes(st)}
                          onCheckedChange={() => handleStatusChange(st)}
                          className="w-4 h-4 border rounded flex items-center justify-center"
                        >
                          {status.includes(st) && <Check className="w-3 h-3" />}
                        </Checkbox.Root>
                        <span className="text-sm">{st}</span>
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </div>
          </div>
        </div>
      </div>

      {/* Botón para agregar nueva especie */}
      <div className="flex justify-center">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3" 
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-5 h-5 mr-2" />
          {showForm ? "Cerrar Formulario" : "Añadir Nueva Especie"}
        </Button>
      </div>

      {/* Formulario para nueva especie */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Nueva Especie</h2>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Nombre</Label>
                <Input placeholder="Nombre común" {...register("nombre", { required: true })} />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Nombre Científico</Label>
                <Input placeholder="Nombre científico" {...register("nombreCientifico", { required: true })} />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Categoría</Label>
                <select className="w-full border border-gray-300 rounded-lg p-3" {...register("categoria")}>
                  {categories.slice(1).map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Estado de Conservación</Label>
                <select className="w-full border border-gray-300 rounded-lg p-3" {...register("estadoConservacion")}>
                  {conservationStatuses.map(st => <option key={st}>{st}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Hábitat</Label>
              <Input placeholder="Hábitat natural" {...register("habitat", { required: true })} />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Descripción</Label>
              <textarea 
                placeholder="Descripción detallada de la especie" 
                className="w-full border border-gray-300 rounded-lg p-3" 
                rows={3} 
                {...register("descripcion", { required: true })} 
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">URL de imagen (opcional)</Label>
              <Input placeholder="URL de imagen o dejar vacío para usar Unsplash" {...register("imagenUrl")} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={formLoading} 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6"
              >
                {formLoading ? "Guardando..." : "Guardar Especie"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
            {formError && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{formError}</div>}
            {formSuccess && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{formSuccess}</div>}
          </form>
        </div>
      )}

      {/* Lista de especies */}
      <div className="space-y-6">
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando especies...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg">{error}</div>
          </div>
        )}
        
        {!loading && !error && filteredSpecies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No se encontraron especies.</div>
          </div>
        )}
        
        {!loading && !error && filteredSpecies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpecies.map((sp, i) => (
              <Card key={sp.id || i} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48 bg-gray-200">
                  {sp.imagenUrl ? (
                    <img 
                      src={sp.imagenUrl} 
                      alt={sp.nombre} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500">Sin imagen</div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Sin imagen
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs text-white font-medium ${getStatusColor(sp.estadoConservacion)}`}>
                      {sp.estadoConservacion}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div>
                    <div className="text-xs uppercase text-blue-600 font-semibold tracking-wide">
                      {sp.categoria}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">{sp.nombre}</h3>
                    <p className="text-sm italic text-gray-600">{sp.nombreCientifico}</p>
                  </div>
                  
                  {sp.habitat && (
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Hábitat</Label>
                      <p className="text-sm text-gray-600 mt-1">{sp.habitat}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 