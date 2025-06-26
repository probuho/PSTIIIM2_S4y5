import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { easyMemory, featuredSpecies, games } from "./data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export default function GamePage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 p-5">
        <Label className="text-4xl">Juegos Educativos</Label>
        <span className="text-sm text-muted-foreground">
          Explora nuestra colección de juegos interactivos diseñados para educar
          y entretener a los jugadores sobre conservación ambiental, protección
          de la vida silvestre y prácticas sostenibles.
        </span>
      </div>
      <Tabs defaultValue="featured">
        <TabsList className="w-[400px] sm:grid sm:grid-cols-4 gap-2">
          <TabsTrigger value="featured">Disponible</TabsTrigger>
          <TabsTrigger value="new">Nuevos</TabsTrigger>
          <TabsTrigger value="popular">Populares</TabsTrigger>
          <TabsTrigger value="myGames">Mis juegos</TabsTrigger>
        </TabsList>
        <Separator />
        <TabsContent value="featured">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {games.map((item) => (
              <Card key={item.id} className="bg-sidebar">
                <CardHeader>
                  <span className="text-2xl">{item.icon}</span>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                  <div className="mt-auto space-x-4">
                    <Button type="button" asChild>
                      <Link to={item.link}>Jugar ahora</Link>
                    </Button>
                    <Button type="button" variant="secondary">
                      Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="new" className="p-4">
          <div className="flex-1 h-70 rounded-lg border-2 border-dashed" />
        </TabsContent>
        <TabsContent value="popular" className="p-4">
          <div className="flex-1 h-70 rounded-lg border-2 border-dashed" />
        </TabsContent>
        <TabsContent value="myGames" className="p-4">
          <div className="flex-1 h-70 rounded-lg border-2 border-dashed" />
        </TabsContent>
      </Tabs>
      <div className="grid gap-4 p-3">
        <Label className="text-2xl">Juego de Memoria de Vida Silvestre</Label>
        <span className="text-sm text-muted-foreground">
          Empareja pares de cartas con especies en peligro para poner a prueba tu memoria
          y aprender sobre la conservación de la vida silvestre.
        </span>
      </div>
      <Tabs defaultValue="easy">
        <TabsList className="w-[400px] ms:grid sm:grid-cols-3 gap-2">
          <TabsTrigger value="easy">Fácil 4x4</TabsTrigger>
          <TabsTrigger value="medium">Medio 6x6</TabsTrigger>
          <TabsTrigger value="hard">Difícil 8x8</TabsTrigger>
        </TabsList>
        <Separator />
        <TabsContent value="easy">
          <div className="grid md:grid-cols-2 gap-4 p-4">
            {easyMemory.map((item, index) => (
              <Card key={index} className="bg-sidebar">
                <CardHeader>
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-muted-foreground">{item.subTitle === 'Game Rules' ? 'Reglas del juego' : item.subTitle === 'Your stats' ? 'Tus estadísticas' : item.subTitle}</span>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <CardTitle>{item.title === 'How To Play' ? 'Cómo jugar' : item.title === 'Game Progress' ? 'Progreso del juego' : item.title}</CardTitle>
                  <CardDescription>{item.description.replace('Flip cards to find matching pairs. Learn about cach each species when you make a match.\nComplete the board as quickly as possible.', 'Voltea cartas para encontrar pares. Aprende sobre cada especie cuando hagas un match.\nCompleta el tablero lo más rápido posible.').replace('Best Time: 2:45 min | Species identified: 18/30 | Current streak: 3 games', 'Mejor tiempo: 2:45 min | Especies identificadas: 18/30 | Racha actual: 3 juegos')}</CardDescription>
                  <div className="mt-auto space-x-4">
                    <Button type="button">Iniciar juego</Button>
                    <Button type="button" variant="secondary">
                      Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="medium" className="p-4">
          <div className="flex-1 h-64 rounded-lg border-2 border-dashed" />
        </TabsContent>
        <TabsContent value="hard" className="p-4">
          <div className="flex-1 h-64 rounded-lg border-2 border-dashed" />
        </TabsContent>
      </Tabs>
      <div className="">
        <Label className="text-2xl p-3">Especies destacadas</Label>
        {featuredSpecies.map((item, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center mb-4 border-b p-1">
              <Avatar className="w-12 h-12 mr-3 rounded-lg">
                <AvatarImage src={item.image} alt={item.name} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-md leading-tight">
                <span className="truncate font-medium">{item.name}</span>
                <span className="truncate text-xs">{item.description}</span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
