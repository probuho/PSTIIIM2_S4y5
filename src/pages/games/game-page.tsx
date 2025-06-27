import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { games } from "./data";
import { useTopScores } from "@/hooks/useTopScores";

// Diccionario de detalles de juegos
const gameDetails: Record<string, { descripcion: string; tutorial: string[]; reglas: string[] }> = {
  "eco-explorer": {
    descripcion: "Responde preguntas y supera retos para convertirte en un verdadero explorador ecológico. Aprende sobre el medio ambiente y la conservación mientras avanzas por diferentes niveles.",
    tutorial: [
      "Lee atentamente cada pregunta o reto.",
      "Selecciona la respuesta correcta o realiza la acción indicada.",
      "Avanza de nivel al acertar y aprende datos curiosos sobre la naturaleza.",
      "Intenta obtener la mayor puntuación posible."
    ],
    reglas: [
      "Tienes un tiempo límite para responder cada pregunta.",
      "Cada respuesta correcta suma puntos, las incorrectas no restan.",
      "Al finalizar, podrás ver tu puntuación y aprender más sobre los temas tratados."
    ]
  },
  "memoria": {
    descripcion: "Pon a prueba tu memoria emparejando cartas de especies en peligro de extinción. Aprende sobre la biodiversidad mientras te diviertes.",
    tutorial: [
      "Haz clic en dos cartas para voltearlas.",
      "Si las cartas coinciden, permanecerán descubiertas.",
      "Si no coinciden, se volverán a ocultar.",
      "Completa el tablero en el menor tiempo y con la menor cantidad de movimientos posible."
    ],
    reglas: [
      "Solo puedes voltear dos cartas a la vez.",
      "El juego termina cuando todas las parejas han sido encontradas.",
      "Tu puntuación depende del tiempo y los movimientos realizados."
    ]
  },
  "species-identification": {
    descripcion: "Pon a prueba tu capacidad para identificar diferentes especies de plantas y animales. Aprende a reconocerlas y conoce datos interesantes sobre cada una.",
    tutorial: [
      "Observa la imagen o descripción de la especie.",
      "Selecciona el nombre correcto entre varias opciones.",
      "Recibe retroalimentación inmediata y aprende sobre cada especie.",
      "Intenta identificar la mayor cantidad posible en el menor tiempo."
    ],
    reglas: [
      "Cada respuesta correcta suma puntos.",
      "No hay penalización por errores, ¡anímate a intentarlo!",
      "Al final, podrás revisar tus aciertos y aprender más sobre las especies."
    ]
  },
  "conservation-simulation": {
    descripcion: "Simula la gestión de un ecosistema y toma decisiones para proteger la biodiversidad. Descubre cómo tus acciones afectan el equilibrio natural.",
    tutorial: [
      "Elige un ecosistema para gestionar.",
      "Toma decisiones sobre conservación, recursos y especies.",
      "Observa cómo tus elecciones afectan el ecosistema en tiempo real.",
      "Aprende sobre el impacto de la conservación y la sostenibilidad."
    ],
    reglas: [
      "Cada decisión tiene consecuencias positivas o negativas.",
      "El objetivo es mantener el equilibrio y la salud del ecosistema.",
      "Puedes reiniciar la simulación y probar diferentes estrategias."
    ]
  }
};

export default function GamePage() {
  // Estado para controlar qué modal está abierto
  const [openModal, setOpenModal] = useState<string | null>(null);
  // Estado para el juego seleccionado en el top (por defecto "Memoria")
  const [selectedGame, setSelectedGame] = useState("Memoria");
  const { scores, loading } = useTopScores(selectedGame, 5);

  return (
    <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto">
      {/* Encabezado principal */}
      <div className="grid gap-4">
        <Label className="text-4xl">Juegos Educativos</Label>
        <span className="text-sm text-muted-foreground">
          Explora nuestra colección de juegos interactivos diseñados para educar y entretener sobre conservación ambiental y vida silvestre.
        </span>
      </div>
      {/* Cards de juegos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-4">
        {games.map((item) => (
          <Card key={item.id} className="bg-sidebar flex flex-col justify-between h-full min-h-[320px] p-2">
            <CardHeader className="pb-2">
              <span className="text-3xl">{item.icon}</span>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription className="text-sm">{item.description}</CardDescription>
              <div className="mt-auto flex flex-col gap-2">
                <Button asChild className="w-full">
                  <a href={item.link}>Jugar ahora</a>
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => setOpenModal(item.id)}>
                  Detalles
                </Button>
              </div>
            </CardContent>
            {/* Modal de detalles para cada juego */}
            <Dialog open={openModal === item.id} onOpenChange={() => setOpenModal(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{item.title}</DialogTitle>
                </DialogHeader>
                <div className="mb-2">
                  <Label className="text-lg mb-2">Descripción</Label>
                  <div className="text-base mt-1 mb-2">{gameDetails[item.id]?.descripcion}</div>
                </div>
                <div className="mb-2">
                  <Label className="text-lg mb-2">Tutorial</Label>
                  <ul className="list-decimal pl-6 space-y-1 mt-2">
                    {gameDetails[item.id]?.tutorial.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2">
                  <Label className="text-lg mb-2">Reglas del juego</Label>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    {gameDetails[item.id]?.reglas.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <DialogFooter>
                  <Button onClick={() => setOpenModal(null)}>Cerrar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>
        ))}
      </div>
      {/* Selector de juego para el top */}
      <div className="flex items-center gap-4 mt-10 mb-2">
        <Label className="text-xl">Top 5 de usuarios en:</Label>
        <select
          className="border rounded-lg px-3 py-1 text-base"
          value={selectedGame}
          onChange={e => setSelectedGame(e.target.value)}
        >
          <option value="Memoria">Memoria</option>
          <option value="Desafío Eco Explorador">Desafío Eco Explorador</option>
          <option value="Cuestionario de Especies">Cuestionario de Especies</option>
          <option value="Simulación de Conservación">Simulación de Conservación</option>
        </select>
      </div>
      {/* Tabla de top 5 de usuarios */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Juego</TableHead>
              <TableHead>Puntaje</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Cargando...</TableCell>
              </TableRow>
            ) : scores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No hay puntajes aún.</TableCell>
              </TableRow>
            ) : (
              scores.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-center">
                    {idx === 0 ? <Crown className="text-yellow-500 w-6 h-6 mx-auto" /> :
                     idx === 1 ? <Medal className="text-gray-400 w-6 h-6 mx-auto" /> :
                     idx === 2 ? <Trophy className="text-amber-700 w-6 h-6 mx-auto" /> :
                     <User className="text-blue-400 w-5 h-5 mx-auto" />}
                  </TableCell>
                  <TableCell>{item.userName}</TableCell>
                  <TableCell>{item.game}</TableCell>
                  <TableCell className="font-bold text-blue-700">{item.score}</TableCell>
                  <TableCell>{item.date?.slice(0, 10)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
