import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Route {
  nombre: string;
  dificultad: string;
  distancia: string;
  fecha: string;
  rating: number;
  reviews: number;
}

interface Props {
  data: Route[];
}

export function DataTableRecentRoutes({ data }: Props) {
  const [filters, setFilters] = React.useState({
    nombre: "",
    dificultad: "",
    distancia: "",
    fecha: "",
    rating: "",
  });

  const filtered = data.filter(route =>
    route.nombre.toLowerCase().includes(filters.nombre.toLowerCase()) &&
    route.dificultad.toLowerCase().includes(filters.dificultad.toLowerCase()) &&
    route.distancia.toLowerCase().includes(filters.distancia.toLowerCase()) &&
    route.fecha.toLowerCase().includes(filters.fecha.toLowerCase()) &&
    (filters.rating === "" || route.rating.toString().includes(filters.rating))
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Input
                placeholder="Ruta"
                value={filters.nombre}
                onChange={e => setFilters(f => ({ ...f, nombre: e.target.value }))}
                className="w-24"
              />
            </TableHead>
            <TableHead>
              <Input
                placeholder="Dificultad"
                value={filters.dificultad}
                onChange={e => setFilters(f => ({ ...f, dificultad: e.target.value }))}
                className="w-20"
              />
            </TableHead>
            <TableHead>
              <Input
                placeholder="Distancia"
                value={filters.distancia}
                onChange={e => setFilters(f => ({ ...f, distancia: e.target.value }))}
                className="w-20"
              />
            </TableHead>
            <TableHead>
              <Input
                placeholder="Fecha"
                value={filters.fecha}
                onChange={e => setFilters(f => ({ ...f, fecha: e.target.value }))}
                className="w-20"
              />
            </TableHead>
            <TableHead>
              <Input
                placeholder="Valoración"
                value={filters.rating}
                onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))}
                className="w-20"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((route, idx) => (
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
  );
} 