import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Route {
  id: number;
  nombre: string;
  dificultad: string;
  distancia: string;
  descripcion: string;
  ubicacion: [number, number];
}

interface Props {
  routes: Route[];
  onVerEnMapa: (routeId: number) => void;
  onGuardar: (route: Route) => void;
}

export function CarouselFeaturedRoutes({ routes, onVerEnMapa, onGuardar }: Props) {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % routes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [routes.length]);

  if (routes.length === 0) return null;
  const route = routes[index];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-xl transition-all duration-500">
        <Card className="bg-white/90 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-lg">{route.nombre}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {route.dificultad} • {route.distancia}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 flex-1">
            <div className="text-base mb-2">{route.descripcion}</div>
            <div className="flex gap-2 mt-auto">
              <Button size="sm" onClick={() => onVerEnMapa(route.id)}>
                Ver en el mapa
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onGuardar(route)}>
                Guardar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-2 mt-2">
        {routes.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full ${i === index ? "bg-blue-500" : "bg-gray-300"}`}
            onClick={() => setIndex(i)}
            aria-label={`Ir a la ruta ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 