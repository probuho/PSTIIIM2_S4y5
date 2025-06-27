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
import { Combobox } from "@/components/ui/combobox";
import { HoverCard } from "@/components/ui/hover-card";
import { CarouselFeaturedRoutes } from "@/components/ui/carousel-featured-routes";
import { DataTableRecentRoutes } from "@/components/ui/data-table-recent-routes";
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

// Hook para centrar el mapa y abrir popup, con validación robusta
function MapFlyTo({ position, popupRef }: { position: [number, number] | null, popupRef: React.RefObject<L.Popup | null> }) {
  const map = useMap();
  React.useEffect(() => {
    if (
      position &&
      Array.isArray(position) &&
      position.length === 2 &&
      typeof position[0] === "number" &&
      typeof position[1] === "number"
    ) {
      try {
        map.flyTo(position, 14, { duration: 1 });
        // Solo abrir el popup si existe y está asociado a la posición
        if (popupRef.current && typeof popupRef.current.openOn === "function") {
          popupRef.current.openOn(map);
        }
      } catch (e) {
        // Si hay error, no hacer nada (evita pantalla en blanco)
        console.error("Error al centrar el mapa o abrir el popup:", e);
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
  // Estado para los filtros
  const [filtroDificultad, setFiltroDificultad] = useState("");
  const [filtroDistancia, setFiltroDistancia] = useState("");
  const [busqueda, setBusqueda] = useState("");
  // Estado para el modal de crear ruta
  const [openCrearRuta, setOpenCrearRuta] = useState(false);
  // Estado del formulario de nueva ruta
  const [nuevaRuta, setNuevaRuta] = useState({
    nombre: "",
    descripcion: "",
    dificultad: "",
    distancia: "",
  });
  // Estado para seleccionar ubicación en el mapa al crear ruta
  const [seleccionandoUbicacion, setSeleccionandoUbicacion] = useState(false);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<[number, number] | null>(null);
  // Estado para la tab seleccionada
  const [tab, setTab] = useState("todas");

  // Opciones para los filtros
  const dificultadOptions = [
    { label: "Todas", value: "" },
    { label: "Fácil", value: "Fácil" },
    { label: "Moderado", value: "Moderado" },
    { label: "Difícil", value: "Difícil" },
  ];
  const distanciaOptions = [
    { label: "Todas", value: "" },
    { label: "0-5 km", value: "0-5" },
    { label: "5-10 km", value: "5-10" },
    { label: ">10 km", value: ">10" },
  ];

  // Función para aplicar el filtro (puedes personalizar la lógica)
  const aplicarFiltro = () => {
    // Aquí puedes filtrar las rutas según los estados de filtroDificultad, filtroDistancia y busqueda
    // Por ahora solo muestra un alert para ejemplo
    alert(`Filtrando por: Dificultad=${filtroDificultad}, Distancia=${filtroDistancia}, Búsqueda=${busqueda}`);
  };

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
    } catch {
      // Puedes mostrar un toast de error si quieres
    }
  };

  // Función para manejar clic en el mapa cuando se está creando una ruta
  const handleMapClick = (e: any) => {
    if (seleccionandoUbicacion) {
      setUbicacionSeleccionada([e.latlng.lat, e.latlng.lng]);
      setSeleccionandoUbicacion(false);
    }
  };

  // Función para abrir el modal y activar selección en el mapa
  const handleAbrirCrearRuta = () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    setOpenCrearRuta(true);
    setSeleccionandoUbicacion(true);
    setUbicacionSeleccionada(null);
  };

  // Modificar handleGuardarRuta para guardar la ubicación
  const handleGuardarRuta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ubicacionSeleccionada) {
      alert("Debes seleccionar una ubicación en el mapa.");
      return;
    }
    // Aquí puedes guardar en localStorage o enviar al backend
    alert(`Ruta creada: ${JSON.stringify({ ...nuevaRuta, ubicacion: ubicacionSeleccionada }, null, 2)}`);
    setOpenCrearRuta(false);
    setNuevaRuta({ nombre: "", descripcion: "", dificultad: "", distancia: "" });
    setUbicacionSeleccionada(null);
  };

  // Función para manejar intentos de interacción de usuarios no autenticados
  const handleRequireAuth = () => {
    setShowLoginModal(true);
  };

  // Simular rutas cercanas (10 rutas aleatorias)
  function generarRutasCercanas() {
    // Simulación: tomar 10 rutas de ejemplo con diferentes ubicaciones y dificultad
    const niveles = ["Fácil", "Moderado", "Difícil"];
    const rutas = [];
    for (let i = 0; i < 10; i++) {
      rutas.push({
        id: 100 + i,
        nombre: `Ruta Cercana ${i + 1}`,
        dificultad: niveles[Math.floor(Math.random() * niveles.length)],
        distancia: `${(Math.random() * 10 + 2).toFixed(1)} km`,
        descripcion: "Ruta generada cerca de tu ubicación (simulada)",
        ubicacion: [
          featuredRoutes[0].ubicacion[0] + (Math.random() - 0.5) * 0.1,
          featuredRoutes[0].ubicacion[1] + (Math.random() - 0.5) * 0.1,
        ],
        creador: "demo",
      });
    }
    return rutas;
  }

  // Obtener rutas favoritas del usuario autenticado
  const getFavoritas = () => {
    if (!session) return [];
    const key = `saved-routes-${session.user.id}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  };

  // Obtener rutas creadas por el usuario autenticado
  const getMisRutas = () => {
    if (!session) return [];
    // Simulación: buscar rutas donde creador sea el usuario
    return featuredRoutes.filter(r => r.creador === session.user.id);
  };

  // Filtrar rutas según la tab seleccionada
  let rutasMostradas = featuredRoutes;
  if (tab === "cercanas") {
    rutasMostradas = generarRutasCercanas();
  } else if (tab === "favoritas") {
    rutasMostradas = getFavoritas();
  } else if (tab === "misrutas") {
    rutasMostradas = getMisRutas();
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          {/* HoverCard explicativo en el título */}
          <HoverCard
            trigger={<Label className="text-4xl cursor-help">Rutas de Senderismo</Label>}
          >
            <div>
              <b>¿Qué puedes hacer aquí?</b>
              <ul className="list-disc pl-4 mt-2">
                <li>Explora rutas de senderismo de diferentes niveles y distancias.</li>
                <li>Filtra por dificultad, distancia o nombre.</li>
                <li>Guarda tus rutas favoritas y crea tus propias rutas.</li>
                <li>Visualiza rutas cercanas a tu ubicación (simulado).</li>
                <li>¡Comparte y descubre nuevas aventuras!</li>
              </ul>
            </div>
          </HoverCard>
          <div className="text-muted-foreground text-base mt-1 ml-4">
            Descubre rutas escénicas y maravillas naturales.
          </div>
        </div>
        {/* Botón para abrir el modal de crear ruta, muestra modal de login si no hay sesión */}
        <Button
          className="h-12 px-8 text-lg rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow"
          size="lg"
          onClick={session ? handleAbrirCrearRuta : handleRequireAuth}
        >
          Crear nueva ruta
        </Button>
      </div>
      {/* Mapa y filtros con layout mejorado */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2 bg-white/80 border rounded-xl shadow p-4">
          {/* Tabs de filtros */}
          <div className="flex flex-wrap gap-2 min-w-[200px]">
            <Button variant={tab === "todas" ? "outline" : "ghost"} className="rounded-full" onClick={() => setTab("todas")}>Todas</Button>
            <Button variant={tab === "cercanas" ? "outline" : "ghost"} className="rounded-full" onClick={session ? () => setTab("cercanas") : handleRequireAuth}>Cercanas</Button>
            <Button variant={tab === "favoritas" ? "outline" : "ghost"} className="rounded-full" onClick={session ? () => setTab("favoritas") : handleRequireAuth}>Favoritas</Button>
            <Button variant={tab === "misrutas" ? "outline" : "ghost"} className="rounded-full" onClick={session ? () => setTab("misrutas") : handleRequireAuth}>Mis rutas</Button>
          </div>
          {/* Input y filtros avanzados */}
          <input
            type="text"
            placeholder="Buscar rutas por nombre, ubicación"
            className="border rounded-lg px-4 py-2 min-w-[140px] flex-1 text-base"
            value={busqueda}
            onChange={session ? (e => setBusqueda(e.target.value)) : () => handleRequireAuth()}
            onFocus={session ? undefined : handleRequireAuth}
            readOnly={!session}
            style={{ maxWidth: 220 }}
          />
          <Combobox
            options={dificultadOptions}
            value={filtroDificultad}
            onChange={session ? setFiltroDificultad : () => handleRequireAuth()}
            placeholder="Dificultad"
            className={`min-w-[120px] flex-1 ${!session ? "opacity-50 cursor-pointer" : ""}`}
          />
          <Combobox
            options={distanciaOptions}
            value={filtroDistancia}
            onChange={session ? setFiltroDistancia : () => handleRequireAuth()}
            placeholder="Distancia"
            className={`min-w-[120px] flex-1 ${!session ? "opacity-50 cursor-pointer" : ""}`}
          />
          <Button variant="secondary" onClick={session ? aplicarFiltro : handleRequireAuth} className="flex-shrink-0">Aplicar filtro</Button>
        </div>
        {/* Mapa interactivo */}
        <div className="w-full h-[340px] rounded-2xl overflow-hidden shadow border relative z-0">
          <MapContainer center={mapCenter as [number, number]} zoom={11} style={{ height: "100%", width: "100%", zIndex: 0 }}
            whenCreated={map => {
              map.on('click', handleMapClick);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {rutasMostradas.map((route) => (
              <Marker
                key={route.id}
                position={route.ubicacion as [number, number]}
                icon={markerIcon as L.Icon}
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
            {/* Mostrar marcador de ubicación seleccionada al crear ruta */}
            {ubicacionSeleccionada && seleccionandoUbicacion === false && (
              <Marker position={ubicacionSeleccionada} icon={markerIcon as L.Icon}>
                <Popup>Ubicación seleccionada para la nueva ruta</Popup>
              </Marker>
            )}
            <MapFlyTo
              position={selectedRouteObj?.ubicacion && Array.isArray(selectedRouteObj.ubicacion) ? selectedRouteObj.ubicacion as [number, number] : null}
              popupRef={selectedRoute && popupRefs.current[selectedRoute] ? { current: popupRefs.current[selectedRoute] } : { current: null }}
            />
          </MapContainer>
          {/* Mensaje de ayuda para seleccionar ubicación */}
          {seleccionandoUbicacion && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white border shadow px-4 py-2 rounded z-[1001] text-sm font-semibold">
              Haz clic en el mapa para seleccionar la ubicación de la nueva ruta
            </div>
          )}
        </div>
      </div>
      {/* Carrusel de rutas destacadas */}
      <div>
        <Label className="text-2xl mb-2 block">Rutas destacadas</Label>
        <CarouselFeaturedRoutes routes={rutasMostradas} onVerEnMapa={routeId => {
          setSelectedRoute(routeId);
          setTimeout(() => {
            const mapDiv = document.querySelector('.leaflet-container');
            if (mapDiv) {
              mapDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 200);
        }} onGuardar={handleSaveRoute} />
      </div>
      {/* DataTable de rutas recientes */}
      <div>
        <Label className="text-2xl mb-2 block">Agregadas recientemente</Label>
        <DataTableRecentRoutes data={recentRoutes} />
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
      {/* Modal para crear nueva ruta */}
      <Dialog open={openCrearRuta} onOpenChange={setOpenCrearRuta}>
        <DialogContent className="max-w-md z-[1000]">
          <DialogHeader>
            <DialogTitle>Crear nueva ruta</DialogTitle>
            <DialogDescription>Completa la información para agregar una nueva ruta de senderismo.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleGuardarRuta}>
            <div>
              <Label>Nombre de la ruta</Label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 w-full"
                value={nuevaRuta.nombre}
                onChange={e => setNuevaRuta({ ...nuevaRuta, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <textarea
                className="border rounded-lg px-3 py-2 w-full"
                value={nuevaRuta.descripcion}
                onChange={e => setNuevaRuta({ ...nuevaRuta, descripcion: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Dificultad</Label>
              <Combobox
                options={dificultadOptions.filter(opt => opt.value !== "")}
                value={nuevaRuta.dificultad}
                onChange={val => setNuevaRuta({ ...nuevaRuta, dificultad: val })}
                placeholder="Selecciona dificultad"
              />
            </div>
            <div>
              <Label>Distancia (km)</Label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="border rounded-lg px-3 py-2 w-full"
                value={nuevaRuta.distancia}
                onChange={e => setNuevaRuta({ ...nuevaRuta, distancia: e.target.value })}
                required
              />
            </div>
            {/* Mostrar ubicación seleccionada */}
            <div>
              <Label>Ubicación seleccionada</Label>
              <div className="text-sm text-muted-foreground">
                {ubicacionSeleccionada
                  ? `Lat: ${ubicacionSeleccionada[0].toFixed(5)}, Lng: ${ubicacionSeleccionada[1].toFixed(5)}`
                  : <span className="text-red-500">No seleccionada. Haz clic en el mapa.</span>}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">Guardar ruta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
