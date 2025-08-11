import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Crown, Medal, Trophy, User, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface GameScore {
  userName: string;
  game: string;
  score: number;
  date: string;
  movimientos?: number;
  tiempo?: number;
  dificultad?: string;
  palabrasCompletadas?: number;
}

interface Props {
  data: GameScore[];
  loading?: boolean;
  error?: string | null;
  title?: string;
}

export function EnhancedScoresTable({ data, loading = false, error = null, title = "Tabla de Puntuaciones" }: Props) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);

  // Filtrar datos por término de búsqueda
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(score =>
      score.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      score.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
      score.dificultad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      score.score.toString().includes(searchTerm)
    );
  }, [data, searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Función para cambiar de página
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Función para obtener el icono según la posición
  const getPositionIcon = (index: number) => {
    const globalIndex = startIndex + index;
    if (globalIndex === 0) return <Crown className="text-yellow-500 w-6 h-6 mx-auto" />;
    if (globalIndex === 1) return <Medal className="text-gray-400 w-6 h-6 mx-auto" />;
    if (globalIndex === 2) return <Trophy className="text-amber-700 w-6 h-6 mx-auto" />;
    return <User className="text-blue-400 w-5 h-5 mx-auto" />;
  };

  return (
    <div className="space-y-4">
      {/* Título y búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar puntuaciones..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 w-full sm:w-64"
            />
          </div>
          {searchTerm && (
            <Button variant="outline" size="sm" onClick={clearSearch}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Información de resultados */}
      <div className="text-sm text-gray-600">
        Mostrando {startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length} puntuaciones
        {searchTerm && ` (filtradas por "${searchTerm}")`}
      </div>

      {/* Tabla con scroll */}
      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead className="w-12 text-center bg-gray-50">#</TableHead>
                <TableHead className="bg-gray-50">Usuario</TableHead>
                <TableHead className="bg-gray-50">Juego</TableHead>
                <TableHead className="bg-gray-50">Puntaje</TableHead>
                <TableHead className="bg-gray-50">Fecha</TableHead>
                <TableHead className="bg-gray-50">Dificultad</TableHead>
                <TableHead className="bg-gray-50">Tiempo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      Cargando puntuaciones...
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-red-600">
                    <div className="flex items-center justify-center gap-2">
                      <span>⚠️</span>
                      {error}
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <div className="py-4">
                      <p>No se encontraron puntuaciones{searchTerm && ` para "${searchTerm}"`}.</p>
                      {searchTerm && (
                        <Button variant="link" onClick={clearSearch} className="mt-2">
                          Limpiar búsqueda
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((score, idx) => (
                  <TableRow key={`${score.userName}-${score.game}-${score.score}-${idx}`} className="hover:bg-gray-50">
                    <TableCell className="text-center">
                      {getPositionIcon(idx)}
                    </TableCell>
                    <TableCell className="font-medium">{score.userName}</TableCell>
                    <TableCell className="font-medium text-blue-600">{score.game}</TableCell>
                    <TableCell className="font-bold text-green-700">{score.score.toLocaleString()}</TableCell>
                    <TableCell>{score.date}</TableCell>
                    <TableCell className="capitalize">
                      {score.dificultad || "N/A"}
                    </TableCell>
                    <TableCell>
                      {score.tiempo ? `${Math.floor(score.tiempo / 60)}:${(score.tiempo % 60).toString().padStart(2, '0')}` : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            
            {/* Números de página */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
