import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const main = [
  {
    title: "Inicio",
    url: "/",
    emoji: "🏠",
  },
  {
    title: "Juegos",
    url: "/games",
    emoji: "🎮",
  },
  {
    title: "Rutas",
    url: "/routes",
    emoji: "🥾",
  },
  {
    title: "Avistamientos",
    url: "/sightings",
    emoji: "👁️",
  },
  {
    title: "Comunidad",
    url: "/community",
    emoji: "👥",
  },
  {
    title: "Especies",
    url: "/especies",
    emoji: "🦋",
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="antialiased">
      <header className="flex gap-4 bg-primary text-white p-5 justify-start items-center">
        <h1 className="font-semibold text-2xl">Guía del Explorador</h1>
        <nav className="hidden md:block">
          {main.map((item, index) => (
            <Link key={index} to={item.url}>
              <Button variant={"ghost"}>
                <span>{item.emoji}</span>
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex gap-2">
          <Button type="button" variant={"ghost"} size={"sm"}>
            <Link to="#">Mi Perfil</Link>
          </Button>
          <Button type="button" variant={"ghost"} size={"sm"}>
            <Link to="#">Comenzar a Explorar</Link>
          </Button>
        </div>
      </header>
      <main className="bg-sidebar-accent p-5">
        <div className="bg-white rounded-md border min-h-svh">{children}</div>
        <div className="*:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 py-3">
          <p>
            &copy;{new Date().getFullYear()} Guía del Explorador. Todos los
            derechos reservados.
          </p>
          <a href="https://github.com/hhazan01">@Hhazan01</a>{" "}
          <a href="https://github.com/probuho">@Probuho</a>
        </div>
      </main>
    </div>
  );
}
