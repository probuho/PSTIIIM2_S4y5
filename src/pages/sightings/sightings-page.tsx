import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, ArrowRight, Image as ImageIcon, ImageOff } from "lucide-react";
import { Inset } from "@radix-ui/themes";

// Datos de ejemplo para cards y tabla
const trendingSightings = [
  {
    id: "halcon-peregrino",
    title: "Halcón Peregrino",
    date: "Raro • Hace 2 días",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Falco_peregrinus_good_-_Christopher_Watson.jpg",
    description: "Avistado cerca del acantilado costero. Adulto cazando sobre el acantilado. Se estiman 3 parejas en la zona.",
    evidence: true,
  },
  {
    id: "oso-negro",
    title: "Oso Negro",
    date: "Común • Hoy",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/08/Black_bear_large.jpg",
    description: "Hembra con dos crías observada en Redwood Canyon Trail. Alimentándose a 100 metros del sendero principal.",
    evidence: true,
  },
  {
    id: "buho-moteado",
    title: "Búho Moteado",
    date: "En peligro • Hace 1 semana",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Strix_occidentalis_caurina_-_USFWS.jpg",
    description: "Pareja anidando en bosque antiguo de Eagle Peak. Primer avistamiento confirmado en 5 años.",
    evidence: false,
  },
];

const communityReports = [
  {
    id: "leon-montana",
    species: "León de montaña",
    location: "Cima Eagle Peak",
    date: "Ayer a las 16:15",
    verified: "Verificado por 3 usuarios",
    evidence: true,
  },
  {
    id: "mariposa-monarca",
    species: "Migración de mariposa monarca",
    location: "Sendero Wildflower Meadow",
    date: "Hace 2 días",
    verified: "Avistamiento masivo - 100+ individuos",
    evidence: false,
  },
  {
    id: "garza-azul",
    species: "Garza azul grande",
    location: "Sendero Riverside Nature Walk",
    date: "Hace 3 días",
    verified: "Pareja anidando con polluelos",
    evidence: true,
  },
  {
    id: "tortuga-desierto",
    species: "Tortuga del desierto",
    location: "Expedición Cañón del Desierto",
    date: "Hace 5 días",
    verified: "En peligro - reportado a conservación",
    evidence: false,
  },
];

export default function SightingsPage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-3xl font-bold">Avistamientos de Vida Silvestre</h1>
      <p className="text-muted-foreground mb-4">Registra y comparte tus encuentros con la naturaleza</p>

      {/* Tabs de navegación estilo comunidad */}
      <Tabs defaultValue="recientes" className="w-full mt-2">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="recientes">Avistamientos recientes</TabsTrigger>
          <TabsTrigger value="mis-reportes">Mis reportes</TabsTrigger>
          <TabsTrigger value="guia">Guía de especies</TabsTrigger>
          <TabsTrigger value="alertas">Alertas de conservación</TabsTrigger>
        </TabsList>
        <TabsContent value="recientes">
          {/* Avistamientos en tendencia con Card + Inset de Radix UI */}
          <div>
            <h2 className="text-xl font-semibold mt-6 mb-2">Avistamientos en tendencia</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingSightings.map((item) => (
                <Card key={item.id} className="bg-slate-100">
                  <CardHeader>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Inset>
                      {item.evidence ? (
                        <img src={item.image} alt={item.title} className="rounded w-full h-40 object-cover mb-2" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-40 bg-slate-200 rounded mb-2">
                          <ImageOff className="text-slate-400 w-10 h-10" />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Button asChild size="sm"><Link to={`/sightings/${item.id}`}>Ver detalles</Link></Button>
                        <Button variant="outline" size="sm">Verificar</Button>
                      </div>
                    </Inset>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="mis-reportes">
          <div className="mt-6 text-center text-muted-foreground">Aquí aparecerán tus reportes personales de avistamientos.</div>
        </TabsContent>
        <TabsContent value="guia">
          <div className="mt-6 text-center text-muted-foreground">Aquí podrás consultar la guía de especies.</div>
        </TabsContent>
        <TabsContent value="alertas">
          <div className="mt-6 text-center text-muted-foreground">Aquí se mostrarán las alertas de conservación.</div>
        </TabsContent>
      </Tabs>

      {/* Buscador y botón fuera de las tabs para mantenerlo visible */}
      <div className="flex gap-2 items-center mt-2">
        <input type="text" placeholder="Buscar por especie, ubicación..." className="border rounded px-3 py-2 w-full" />
        <Button variant="success">Reportar avistamiento</Button>
      </div>

      {/* Reportes recientes de la comunidad con Table de Shadcn UI */}
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Reportes recientes de la comunidad</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Especie</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Fecha y hora</TableHead>
              <TableHead>Verificado por</TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {communityReports.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-center">
                  {item.evidence ? <ImageIcon className="text-green-500 w-5 h-5 mx-auto" /> : <ImageOff className="text-slate-400 w-5 h-5 mx-auto" />}
                </TableCell>
                <TableCell>{item.species}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.verified}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon"><MoreHorizontal className="w-5 h-5" /></Button>
                </TableCell>
                <TableCell className="text-center">
                  <Button asChild variant="ghost" size="icon"><Link to={`/sightings/${item.id}`}><ArrowRight className="w-5 h-5" /></Link></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Destacados de conservación */}
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Destacados de conservación</h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2"><span className="text-xl">⚠️</span> Alerta de temporada de anidación: Varias especies de aves están anidando. Mantén distancia en los senderos marcados.</li>
          <li className="flex items-center gap-2"><span className="text-xl">🌱</span> Proyecto de restauración de hábitat: Oportunidad de voluntariado este fin de semana en Lakeside Mountain Trail.</li>
          <li className="flex items-center gap-2"><span className="text-xl">🦠</span> Alerta de especie invasora: Reporta avistamientos de linterna manchada en las secciones orientales del sendero.</li>
        </ul>
      </div>

      {/* Especie del mes */}
      <div className="mt-8">
        <Card className="bg-violet-50">
          <CardHeader>
            <CardTitle>Especie del mes</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">Destacado de abril</span>
            <h3 className="text-lg font-semibold">Halcón Cola Roja</h3>
            <p>Conoce más sobre este majestuoso rapaz, su hábitat y estado de conservación. Únete a nuestro tour de observación este fin de semana.</p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm">Más información</Button>
              <Button variant="success" size="sm">Unirse al tour</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 