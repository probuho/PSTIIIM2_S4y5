import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

// Diccionario de traducción para los segmentos de la URL
const breadcrumbTranslations: Record<string, string> = {
  home: "Inicio",
  games: "Juegos",
  memory: "Memoria",
  crossword: "Crucigrama",
  quiz: "Quiz",
  hangman: "Ahorcado",
  routes: "Rutas",
  especies: "Especies",
  community: "Comunidad",
  sightings: "Avistamientos",
  profile: "Perfil",
  register: "Registro",
  login: "Iniciar sesión",
  "unsplash-demo": "Demostración Unsplash",
};

function translate(segment: string) {
  return (
    breadcrumbTranslations[segment] ||
    segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}

export function DynamicBreadcrumb() {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Inicio</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathnames.map((name, index) => {
          const to = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;
          const translated = translate(decodeURIComponent(name));

          return (
            <React.Fragment key={to}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{translated}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={to}>{translated}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
