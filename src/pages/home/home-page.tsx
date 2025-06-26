import React from "react";
import { Button } from "@/components/ui/button";
import { main } from "@/pages/main-menu";
import { Link, useLocation } from "react-router-dom";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { contributions, modules, stats } from "@/pages/home/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ShaderBackground from "@/components/ShaderBackground";

export default function HomePage() {
  const location = useLocation();

  return (
    <div className="flex flex-col gap-8">
      {/* Jumbotron visual principal */}
      <div className="relative overflow-hidden rounded-xl min-h-[300px] flex items-center justify-center mb-8">
        <ShaderBackground />
        <div className="relative z-10 p-8 text-center">
          <h1 className="text-4xl font-bold mb-2">¡Bienvenido a la exploración!</h1>
          <p className="text-lg text-muted-foreground">Descubre, aprende y comparte sobre la naturaleza con la comunidad.</p>
        </div>
      </div>
      <section className="flex flex-col gap-4">
        <Label className="text-2xl font-bold">Módulos Destacados</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {modules.map((item) => (
            <Card key={item.id} className="bg-sidebar">
              <CardHeader>
                <span className="text-4xl">{item.icon}</span>
                {item.title}
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button type="button" className="w-full" asChild>
                  <Link to={item.link}>{item.buttonText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <Label className="text-2xl font-bold">
          Últimas Contribuciones de la Comunidad
        </Label>
        <div className="">
          {contributions.map((item) => (
            <React.Fragment key={item.id}>
              <div className="flex items-center mb-4 border-b p-1">
                <Avatar className="w-12 h-12 mr-3 rounded-lg">
                  <AvatarImage src={item.avatar} alt={item.author} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-md leading-tight">
                  <span className="truncate font-medium">{item.author}</span>
                  <span className="truncate text-xs">{item.title}</span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <Label className="text-2xl font-bold">Estadísticas Ambientales</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {stats.map((item) => (
            <Card key={item.id} className="bg-sidebar">
              <CardHeader className="flex flex-col items-center justify-center gap-4">
                <CardTitle className="text-3xl">{item.icon}</CardTitle>
                <span className="text-violet-500 font-semibold text-5xl">
                  {item.number}
                </span>
              </CardHeader>
              <CardContent>{item.label}</CardContent>
            </Card>
          ))}
        </div>
      </section>
      <div className="flex justify-center items-center">
        <Button type="button" asChild>
          <Link to="/community">Únete a Nuestra Comunidad</Link>
        </Button>
      </div>
    </div>
  );
}
