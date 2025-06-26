import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSession } from "@/components/context/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
// Si quieres tipado instala: npm i --save-dev @types/leaflet

// Icono personalizado para Leaflet
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Datos de ejemplo para rutas
const featuredRoutes = [
  {
    id: 1,
    nombre: "Sendero del Cañón Rojo",
    dificultad: "Moderado",
    distancia: "8.4 km",
    descripcion: "Bosque antiguo con secuoyas y fauna diversa. Sendero bien mantenido con elevación moderada.",
    ubicacion: [37.7749, -122.4194],
  },
  {
    id: 2,
    nombre: "Bucle Costero",
    dificultad: "Fácil",
    distancia: "6.1 km",
    descripcion: "Ruta costera escénica con vistas panorámicas al océano. Ideal para familias y principiantes.",
    ubicacion: [37.8044, -122.2711],
  },
  {
    id: 3,
    nombre: "Cumbre Pico Águila",
    dificultad: "Difícil",
    distancia: "14 km",
    descripcion: "Ruta de montaña desafiante con vistas espectaculares. Se requiere buena condición física.",
    ubicacion: [37.6879, -122.4702],
  },
];

const recentRoutes = [
  {
    nombre: "Senda de los Prados",
    dificultad: "Fácil",
    distancia: "3.2 km",
    fecha: "Hace 2 días",
    rating: 4.8,
    reviews: 32,
  },
  {
    nombre: "Ruta Montaña del Lago",
    dificultad: "Moderado",
    distancia: "9.7 km",
    fecha: "Hace 3 días",
    rating: 4.6,
    reviews: 47,
  },
  {
    nombre: "Expedición Cañón Desértico",
    dificultad: "Difícil",
    distancia: "12.5 km",
    fecha: "Hace 5 días",
    rating: 4.9,
    reviews: 18,
  },
  {
    nombre: "Paseo Natural Riverside",
    dificultad: "Fácil",
    distancia: "2.1 km",
    fecha: "Hace 1 semana",
    rating: 4.5,
    reviews: 63,
  },
];

const achievements = [
  { label: "Rutas nuevas mapeadas", value: 328, icon: "📍" },
  { label: "Kilómetros recorridos", value: 12450, icon: "🥾" },
  { label: "Fotos compartidas", value: 4872, icon: "📷" },
];

// Componente para animar números
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    const start = 0;
    const end = value;
    if (start === end) return;
    const increment = end / 60;
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span className="font-bold text-2xl tabular-nums">{display.toLocaleString()}</span>;
}

// Hook para centrar el mapa y abrir popup
function MapFlyTo({ position, popupRef }: { position: [number, number] | null, popupRef: React.RefObject<L.Popup> }) {
  const map = useMap();
  React.useEffect(() => {
    if (position && Array.isArray(position) && position.length === 2 && typeof position[0] === 'number' && typeof position[1] === 'number') {
      map.flyTo(position, 14, { duration: 1 });
      if (popupRef.current && typeof popupRef.current.openOn === 'function') {
        popupRef.current.openOn(map);
      }
    }
  }, [position]);
  return null;
}

export default function RoutesPage() {
  const { session } = useSession();
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const popupRefs = useRef<{ [key: number]: L.Popup | null }>({});

  // Centrar el mapa en la primera ruta destacada o la seleccionada
  const selectedRouteObj = selectedRoute ? featuredRoutes.find((r) => r.id === selectedRoute) : null;
  const mapCenter = selectedRouteObj?.ubicacion || featuredRoutes[0].ubicacion;

  // Guardar ruta en localStorage y backend
  const handleSaveRoute = async (route: typeof featuredRoutes[0]) => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    // Guardar en localStorage
    const key = `saved-routes-${session.user.id}`;
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    const exists = saved.some((r: any) => r.id === route.id);
    if (!exists) {
      localStorage.setItem(key, JSON.stringify([...saved, route]));
    }
    // Guardar en backend (puedes ajustar la URL y lógica según tu API)
    try {
      await fetch("/api/routes/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ routeId: route.id }),
      });
    } catch (e) {
      // Puedes mostrar un toast de error si quieres
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <Label className="text-4xl">Rutas de Senderismo</Label>
          <div className="text-muted-foreground text-base mt-1">
            Descubre rutas escénicas y maravillas naturales.
          </div>
        </div>
        <Button className="h-12 px-8 text-lg rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow" size="lg">
          Crear nueva ruta
        </Button>
      </div>
      {/* Mapa y filtros */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-full">Todas</Button>
            <Button variant="ghost" className="rounded-full">Cercanas</Button>
            <Button variant="ghost" className="rounded-full">Favoritas</Button>
            <Button variant="ghost" className="rounded-full">Mis rutas</Button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar rutas por nombre, ubicación o dificultad"
              className="border rounded-lg px-4 py-2 w-72 text-base"
            />
            <Button variant="secondary">Filtros</Button>
          </div>
        </div>
        {/* Mapa interactivo */}
        <div className="w-full h-[340px] rounded-2xl overflow-hidden shadow border">
          <MapContainer center={mapCenter as any} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {featuredRoutes.map((route) => (
              <Marker
                key={route.id}
                position={route.ubicacion as any}
                icon={markerIcon as any}
                eventHandlers={{
                  click: () => setSelectedRoute(route.id),
                }}
              >
                <Popup ref={(ref) => (popupRefs.current[route.id] = ref)}>
                  <b>{route.nombre}</b><br />
                  {route.descripcion}
                </Popup>
              </Marker>
            ))}
            <MapFlyTo position={selectedRouteObj ? (selectedRouteObj.ubicacion as [number, number]) : null} popupRef={selectedRouteObj ? { current: popupRefs.current[selectedRouteObj.id] } : { current: null }} />
          </MapContainer>
        </div>
      </div>
      {/* Rutas destacadas */}
      <div>
        <Label className="text-2xl mb-2 block">Rutas destacadas</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredRoutes.map((route) => (
            <Card key={route.id} className="bg-white/90 flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-lg">{route.nombre}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {route.dificultad} • {route.distancia}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 flex-1">
                <div className="text-base mb-2">{route.descripcion}</div>
                <div className="flex gap-2 mt-auto">
                  <Button size="sm" onClick={() => setSelectedRoute(route.id)}>
                    Ver en el mapa
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleSaveRoute(route)}>
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Rutas recientes */}
      <div>
        <Label className="text-2xl mb-2 block">Agregadas recientemente</Label>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ruta</TableHead>
              <TableHead>Dificultad</TableHead>
              <TableHead>Distancia</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Valoración</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentRoutes.map((route, idx) => (
              <TableRow key={idx}>
                <TableCell>{route.nombre}</TableCell>
                <TableCell>{route.dificultad}</TableCell>
                <TableCell>{route.distancia}</TableCell>
                <TableCell>{route.fecha}</TableCell>
                <TableCell>{route.rating} ★ ({route.reviews})</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Logros de la comunidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {achievements.map((ach, idx) => (
          <Card key={idx} className="bg-white/90 flex flex-col items-center py-6">
            <span className="text-4xl mb-2">{ach.icon}</span>
            <AnimatedNumber value={ach.value} />
            <span className="text-base text-muted-foreground mt-1">{ach.label}</span>
          </Card>
        ))}
      </div>
      {/* Modal de inicio de sesión */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inicia sesión para guardar rutas</DialogTitle>
            <DialogDescription>
              Debes iniciar sesión para poder guardar rutas en tu perfil y acceder a ellas desde cualquier dispositivo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => { setShowLoginModal(false); window.location.href = "/login"; }}>
              Ir a iniciar sesión
            </Button>
            <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
