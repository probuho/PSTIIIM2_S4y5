import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Datos simulados de especies
const featuredSpecies = [
  {
    type: "AVE",
    name: "Halcón Peregrino",
    scientific: "Falco peregrinus",
    status: "Recuperándose",
    category: "Aves",
  },
  {
    type: "MAMÍFERO",
    name: "Lince Ibérico",
    scientific: "Lynx pardinus",
    status: "En peligro",
    category: "Mamíferos",
  },
  {
    type: "REPTIL",
    name: "Lagarto Ocelado",
    scientific: "Timon lepidus",
    status: "Vulnerable",
    category: "Reptiles",
  },
];

const mammals = [
  {
    name: "Lince Ibérico",
    scientific: "Lynx pardinus",
    habitat: "Bosque mediterráneo",
  },
  {
    name: "Lobo Ibérico",
    scientific: "Canis lupus signatus",
    habitat: "Montañas y bosques",
  },
  {
    name: "Oso Pardo",
    scientific: "Ursus arctos",
    habitat: "Cordillera Cantábrica",
  },
];

const birds = [
  {
    name: "Halcón Peregrino",
    scientific: "Falco peregrinus",
    habitat: "Acantilados costeros",
  },
  {
    name: "Águila Imperial",
    scientific: "Aquila adalberti",
    habitat: "Bosques y dehesas",
  },
  {
    name: "Buitre Negro",
    scientific: "Aegypius monachus",
    habitat: "Zonas montañosas",
  },
];

const reptiles = [
  {
    name: "Lagarto Ocelado",
    scientific: "Timon lepidus",
    habitat: "Matorrales mediterráneos",
  },
  {
    name: "Vibora Hocicuda",
    scientific: "Vipera latastei",
    habitat: "Zonas rocosas",
  },
  {
    name: "Camaleón Común",
    scientific: "Chamaeleo chamaeleon",
    habitat: "Zonas costeras",
  },
];

const categories = [
  "Todos",
  "Mamíferos",
  "Aves",
  "Reptiles",
  "Anfibios",
  "Peces",
];

export default function SpeciesPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("Todos");

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-2 text-sm text-muted-foreground">Wildlife Sightings &gt; Species</div>
      <h1 className="text-4xl font-bold mb-2">Especies</h1>
      <p className="mb-4 text-lg text-muted-foreground">Descubre y explora la diversidad de especies en nuestra región</p>
      <div className="mb-4">
        <Input
          placeholder="Nombre, tipo o hábitat"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>
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
      <h2 className="text-2xl font-semibold mb-2">Especies Destacadas</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {featuredSpecies.map((sp, i) => (
          <Card key={i} className="p-4 flex flex-col gap-2 bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-400" />
              <div>
                <div className="uppercase text-xs text-muted-foreground">{sp.type}</div>
                <div className="font-bold text-lg">{sp.name}</div>
                <div className="text-xs italic text-muted-foreground">{sp.scientific} • Estado: {sp.status}</div>
              </div>
            </div>
            <Button className="mt-2 w-fit" size="sm">Ver Detalles</Button>
          </Card>
        ))}
      </div>
      <h2 className="text-xl font-bold mt-6 mb-2">Mamíferos</h2>
      <div className="flex flex-col gap-2 mb-6">
        {mammals.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neutral-300" />
            <div>
              <span className="font-semibold">{m.name}</span> <span className="text-xs text-muted-foreground">{m.scientific} • {m.habitat}</span>
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-bold mt-6 mb-2">Aves</h2>
      <div className="flex flex-col gap-2 mb-6">
        {birds.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neutral-300 flex items-center justify-center">+</div>
            <div>
              <span className="font-semibold">{b.name}</span> <span className="text-xs text-muted-foreground">{b.scientific} • {b.habitat}</span>
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-bold mt-6 mb-2">Reptiles</h2>
      <div className="flex flex-col gap-2 mb-6">
        {reptiles.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neutral-300 flex items-center justify-center">▼</div>
            <div>
              <span className="font-semibold">{r.name}</span> <span className="text-xs text-muted-foreground">{r.scientific} • {r.habitat}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-8">
        <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold">Añadir Nueva Especie</Button>
        <Button variant="secondary">Volver a Avistamientos</Button>
      </div>
    </div>
  );
} 