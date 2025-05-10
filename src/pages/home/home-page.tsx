import React from "react";
import { Button } from "@/components/ui/button";
import { main } from "@/pages/layout";
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

export default function HomePage() {
  const location = useLocation();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-center items-center gap-4">
        <h1 className="text-4xl font-semibold">Guía del Explorador</h1>
        <h2 className="text-muted-foreground">Explora, Aprende y Conserva</h2>
        <Button type="button" asChild>
          <Link to="/discover">Descubrir la Naturaleza</Link>
        </Button>
      </div>
      <div className="flex gap-4 justify-center items-center">
        {main.map((item, index) => {
          const isActive = location.pathname === item.url;
          return (
            <Button
              key={index}
              type="button"
              variant={isActive ? "default" : "secondary"}
              size={"icon"}
              asChild
            >
              <Link to={item.url}>{item.emoji}</Link>
            </Button>
          );
        })}
      </div>
      <section className="flex flex-col gap-4">
        <Label className="text-2xl font-bold">Módulos Destacados</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {modules.map((item) => (
            <Card key={item.id}>
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
              <div className="flex items-center mb-4 rounded-md border p-2">
                <Avatar className="w-12 h-12 mr-3">
                  <AvatarImage src={item.avatar} alt={item.author} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full bg-white p-1 gap-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">Por {item.author}</p>
                    <span className="ml-auto text-xs text-zinc-400">
                      {item.timeAgo}
                    </span>
                  </div>
                  <p className="text-gray-700">{item.title}</p>
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
            <Card key={item.id}>
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
