import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import * as Select from "@radix-ui/react-select";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Search, Check } from "lucide-react";

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

// Esquema básico para el formulario (puedes mejorarlo luego)
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
  const [status, setStatus] = useState<string[]>([]); // Multi-select
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
      let url = `http://localhost:5000/api/species?limit=100`;
      if (selected !== "Todos") url += `&categoria=${encodeURIComponent(selected)}`;
      if (status.length > 0) url += status.map(st => `&estadoConservacion=${encodeURIComponent(st)}`).join("");
      const res = await fetch(url);
      const data = await res.json();
      setSpecies(data.data || []);
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

  // Filtrar por búsqueda local (nombre, científico, hábitat)
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
      const res = await fetch("http://localhost:5000/api/species", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al crear especie");
      setFormSuccess("¡Especie creada exitosamente!");
      reset(initialForm);
      setShowForm(false);
      fetchSpecies();
    } catch (err: any) {
      setFormError(err.message || "Error desconocido");
    } finally {
      setFormLoading(false);
    }
  };

  // Manejar búsqueda al presionar Enter o hacer clic en el icono
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchSpecies(search);
  };

  // Multi-select para estados de conservación
  const handleStatusChange = (value: string) => {
    setStatus(prev =>
      prev.includes(value) ? prev.filter(st => st !== value) : [...prev, value]
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-2 text-sm text-muted-foreground">Wildlife Sightings &gt; Species</div>
      <h1 className="text-4xl font-bold mb-2">Especies</h1>
      <p className="mb-4 text-lg text-muted-foreground">Descubre y explora la diversidad de especies en nuestra región</p>
      <form className="mb-4 flex flex-col md:flex-row gap-2 md:items-center" onSubmit={handleSearch}>
        <div className="flex items-center gap-2 w-full max-w-md">
          <Input
            placeholder="Nombre, tipo o hábitat"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
            onKeyDown={e => { if (e.key === "Enter") handleSearch(e as any); }}
          />
          <Button type="submit" variant="outline" className="p-2" aria-label="Buscar">
            <Search width={18} height={18} />
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap mt-2 md:mt-0">
          <Label className="mr-2">Estado:</Label>
          <Select.Root
            onValueChange={value => handleStatusChange(value)}
            value={status.length === 1 ? status[0] : ""}
          >
            <Select.Trigger className="border rounded p-2 min-w-[180px] bg-white">
              <span>{status.length > 0 ? status.join(", ") : "Seleccionar estado(s)"}</span>
            </Select.Trigger>
            <Select.Content className="bg-white border rounded shadow-lg z-50">
              <Select.Group>
                <Select.Label className="px-2 py-1 text-xs text-gray-500">Estados de conservación</Select.Label>
                {conservationStatuses.map(st => (
                  <Select.Item key={st} value={st} className="flex items-center gap-2 px-2 py-1 cursor-pointer">
                    <Checkbox.Root
                      checked={status.includes(st)}
                      onCheckedChange={() => handleStatusChange(st)}
                      className="w-4 h-4 border rounded flex items-center justify-center"
                    >
                      {status.includes(st) && <Check className="w-3 h-3" />}
                    </Checkbox.Root>
                    <span>{st}</span>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </div>
      </form>
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selected === cat ? "default" : "secondary"}
            onClick={() => setSelected(cat)}
            className="rounded-full px-4"
          >
            {cat}
          </Button>
        ))}
      </div>
      {loading && <div className="text-center my-8">Cargando especies...</div>}
      {error && <div className="text-center text-red-500 my-8">{error}</div>}
      {!loading && !error && filteredSpecies.length === 0 && (
        <div className="text-center my-8">No se encontraron especies.</div>
      )}
      {!loading && !error && filteredSpecies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {filteredSpecies.map((sp, i) => (
            <Card key={sp.id || i} className="p-4 flex flex-col gap-2 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-400 overflow-hidden">
                  {sp.imagenUrl && <img src={sp.imagenUrl} alt={sp.nombre} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <div className="uppercase text-xs text-muted-foreground">{sp.categoria}</div>
                  <div className="font-bold text-lg">{sp.nombre}</div>
                  <div className="text-xs italic text-muted-foreground">{sp.nombreCientifico} • Estado: {sp.estadoConservacion}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{sp.habitat}</div>
              <Button className="mt-2 w-fit" size="sm">Ver Detalles</Button>
            </Card>
          ))}
        </div>
      )}
      <div className="flex gap-4 mt-8">
        <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cerrar Formulario" : "Añadir Nueva Especie"}
        </Button>
        <Button variant="secondary">Volver a Avistamientos</Button>
      </div>
      {showForm && (
        <form className="bg-white p-4 rounded shadow mt-6 flex flex-col gap-3 max-w-xl" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-lg font-bold mb-2">Nueva Especie</h2>
          <Input placeholder="Nombre" {...register("nombre", { required: true })} />
          <Input placeholder="Nombre Científico" {...register("nombreCientifico", { required: true })} />
          <select className="border rounded p-2" {...register("categoria")}>{categories.slice(1).map(cat => <option key={cat}>{cat}</option>)}</select>
          <select className="border rounded p-2" {...register("estadoConservacion")}>{conservationStatuses.map(st => <option key={st}>{st}</option>)}</select>
          <Input placeholder="Hábitat" {...register("habitat", { required: true })} />
          <textarea placeholder="Descripción" className="border rounded p-2" rows={3} {...register("descripcion", { required: true })} />
          <Input placeholder="URL de imagen (opcional)" {...register("imagenUrl")} />
          <div className="flex gap-2 mt-2">
            <Button type="submit" disabled={formLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold">{formLoading ? "Guardando..." : "Guardar"}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
          {formError && <div className="text-red-500 text-sm mt-2">{formError}</div>}
          {formSuccess && <div className="text-green-600 text-sm mt-2">{formSuccess}</div>}
        </form>
      )}
    </div>
  );
} 