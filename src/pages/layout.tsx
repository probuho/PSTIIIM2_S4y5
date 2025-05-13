import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useSession } from "@/components/context/auth-context";
import { LogOut } from "lucide-react";

export const main = [
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
  const location = useLocation();
  const { session, logOut } = useSession();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 flex gap-4 bg-primary text-white p-4 justify-start items-center">
        <h1 className="font-semibold text-2xl">Guía del Explorador</h1>
        <nav className="hidden lg:block space-x-2">
          {main.map((item, index) => {
            const isActive = location.pathname === item.url;
            return (
              <Button
                key={index}
                variant={isActive ? "secondary" : "ghost"}
                asChild
              >
                <Link to={item.url}>
                  <span>{item.emoji}</span>
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </nav>
        <div className="ml-auto flex gap-2">
          {session?.user ? (
            <Button
              type="button"
              variant={"ghost"}
              size={"sm"}
              onClick={logOut}
            >
              <LogOut className="h-4 w-4" /> Cerrar Sesión
            </Button>
          ) : (
            <Button type="button" variant={"ghost"} size={"sm"}>
              <Link to="/login">Comenzar a Explorar</Link>
            </Button>
          )}
        </div>
      </header>
      <div className="h-[100px]" />
      <main className="flex-1 overflow-y-auto p-5 pt-0 flex justify-center items-start">
        <div className="w-full md:w-[1050px]">{children}</div>
      </main>
      <footer className="border-t py-2">
        <div className="*:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 py-3">
          <p>
            &copy;{new Date().getFullYear()} Guía del Explorador. Todos los
            derechos reservados.
          </p>
          <a href="https://github.com/hhazan01">@Hhazan01</a>{" "}
          <a href="https://github.com/probuho">@Probuho</a>
        </div>
      </footer>
    </div>
  );
}
