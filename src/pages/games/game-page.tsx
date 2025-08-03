import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trophy, Medal, Crown, User, AlertCircle } from 'lucide-react';
import { games } from "./data";
import { useTopScores } from "@/hooks/useTopScores";



// Diccionario de detalles de juegos
const gameDetails: Record<string, { descripcion: string; tutorial: string[]; reglas: string[] }> = {
  "crucigrama": {
    descripcion: "Demuestra tus conocimientos como verdadero explorador ecológico al identificar las organismos del planeta con las pistas dadas.",
    tutorial: [
      "Lee atentamente cada pista ofrecida.",
      "Selecciona la casilla correspondiente a la pista.",
      "Ingresa el nombre de la especie.",
      "Descubre todas las especies para ganar."
    ],
    reglas: [
      "Al seleccionar una casilla la pista correspondiente a esa palabra se resaltara.",
      "Tras leer la pista de la palabra se tienen que ingresar letras en cada casilla hasta completar la palabra.",
      "De acertar el nombre de la especie se sumará el puntaje aumentara.",
      "Al rellenar todas las casillas se obtendra la puntuación máxima y el juego terminará.",
      "La puntuación final dependerá del modo de dificultad completado."
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
  "quiz": {
    descripcion: "Pon a prueba tus conocimientos sobre el reino animal en este quiz de la naturaleza que te enseña las características de las criaturas que viven en este planeta.",
    tutorial: [
      "Lee atentamente cada pregunta.",
      "Selecciona la respuesta correcta.",
      "Avanza a la siguiente pregunta y aprende datos curiosos sobre los seres vivos.",
      "Intenta obtener la mayor puntuación posible."
    ],
    reglas: [
      "Tienes un tiempo límite para responder cada pregunta.",
      "Cada respuesta correcta suma puntos, las incorrectas no restan.",
      "Al finalizar, podrás ver tu puntuación."
    ]
  },
  "ahorcado": {
    descripcion: "Descubre que tan bien conoces a las criaturas que cubren este planeta adivinando la especie.",
    tutorial: [
      "Ve el largo de las palabras.",
      "Selecciona una letra.",
      "Analiza el nombre de que animal encaja en el espacio disponible y con las letras acertadas.",
      "Memoriza los nombres de los animales.",
      "La puntuación que consigas al final dependera de cuantas preguntas acertaras y en cuanto tiempo."
    ],
    reglas: [
      "Hay un límite de tiempo e intentos por dificultad.",
      "Al seleccionar una letra esta puede o no estar dentro del nombre a adivinar.",
      "Las letras que están se marca de verde en el teclado virtual y aparecen en el espacio correspondiente, las que no están se marcan de rojo en el teclado.",
      "Al finalizar la partida se revela la palabra que era y se revela tú puntuación la cual se calcula en base a la dificulta, tiempo y movimientos restantes."
    ]
  }
};

export default function GamePage() {
  // Estado para controlar qué modal está abierto
  const [openModal, setOpenModal] = useState<string | null>(null);
  // Estado para el juego seleccionado en el top (por defecto "Memoria")
  const [selectedGame, setSelectedGame] = useState("Memoria");
  const { scores, loading, error } = useTopScores(selectedGame, 5);

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
          <option value="Memoria">Memoria animal</option>
          <option value="Crucigrama">Crucigrama de identificación de especies</option>
          <option value="Quiz">Desafío eco explorador</option>
          <option value="Ahorcado">Adivina el animal</option>
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
                <TableCell colSpan={5} className="text-center">Cargando puntuaciones...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-600">
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                </TableCell>
              </TableRow>
            ) : scores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay puntuaciones registradas para {selectedGame} aún.
                </TableCell>
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
                  <TableCell className="font-medium">{item.userName}</TableCell>
                  <TableCell>{item.game}</TableCell>
                  <TableCell className="font-bold text-blue-700">{item.score.toLocaleString()}</TableCell>
                  <TableCell>{item.date}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
