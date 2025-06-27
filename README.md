# Guía del Explorador Planetario

**Versión definitiva y funcional — 27/06/2025**

---

## Descripción General

Guía del Explorador Planetario es una aplicación web educativa y gamificada para la exploración de la naturaleza, avistamientos de fauna, rutas de senderismo y aprendizaje colaborativo. El proyecto está construido con un stack moderno y escalable, orientado a la experiencia de usuario y la mantenibilidad del código.

---

## Tecnologías principales

- **Frontend:**
  - React 18 + TypeScript
  - Vite
  - Tailwind CSS (con paleta Slate)
  - Shadcn UI (Radix UI)
  - Lucide React Icons
  - React Router DOM
- **Backend:**
  - Node.js + Express (en `/server`)
  - Prisma ORM
  - MongoDB
- **Otros:**
  - ESLint, Prettier
  - Context API para autenticación
  - Hooks personalizados

---

## Estructura del Proyecto

```
PSTIIIM2_S4y5/
├── src/
│   ├── assets/           # Imágenes y recursos
│   ├── components/       # Componentes UI y utilidades
│   ├── hooks/            # Hooks personalizados
│   ├── lib/              # Utilidades globales
│   ├── pages/            # Vistas principales (home, games, routes, sightings, community, especies, auth...)
│   └── index.css         # Estilos globales
├── server/               # Backend Express + Prisma
├── public/               # Archivos estáticos
├── package.json
├── tailwind.config.ts
├── README.md
└── ...
```

---

## Módulos y Funcionalidades

### 1. **Autenticación y Usuario**
- Registro e inicio de sesión centralizados (flujo rápido y sencillo).
- Menú de usuario con opciones de perfil y logout.
- Acceso condicional a rutas protegidas (crear rutas, comunidad, etc.).

### 2. **Juegos**
- Juegos educativos con historial de puntuaciones y top 5 de usuarios.
- Modales personalizados y feedback visual.

### 3. **Rutas de Senderismo**
- Mapa interactivo (Leaflet) para explorar y crear rutas.
- Tabs: Todas, Cercanas, Favoritas, Mis rutas.
- Filtros responsivos y acciones protegidas por autenticación.
- Carrusel de rutas destacadas y DataTable de rutas recientes.

### 4. **Avistamientos**
- Listado y detalle de avistamientos de fauna.
- Vista de detalle con imagen, ubicación, clima, notas y comentarios de la comunidad.
- Breadcrumbs claros y navegación intuitiva.

### 5. **Especies**
- Catálogo de especies destacadas y por categoría (mamíferos, aves, reptiles, etc.).
- Búsqueda y filtros por nombre, tipo o hábitat.
- Botón para añadir nueva especie (próximamente).

### 6. **Comunidad**
- Foro con tabs: Temas, Discusiones, Preguntas, Wiki, Eventos, Guías.
- Resumen de avistamientos verificados y modal con info de Wikipedia.
- Formulario para crear temas (solo usuarios autenticados).

---

## Experiencia de Usuario
- Navbar fijo con navegación principal y menú de usuario desplegable.
- Diseño responsivo y accesible.
- Breadcrumbs automáticos y traducidos.
- Feedback visual en formularios y acciones.

---

## Instalación y uso

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/probuho/PSTIIIM2_S4y5.git
   cd PSTIIIM2_S4y5
   ```
2. **Instala dependencias:**
   ```bash
   npm install
   ```
3. **Inicia el frontend:**
   ```bash
   npm run dev
   ```
4. **(Opcional) Inicia el backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

---

## Dependencias principales

- `react`, `react-dom`, `react-router-dom`
- `@radix-ui/react-*`, `lucide-react`, `shadcn/ui`
- `tailwindcss`, `clsx`, `class-variance-authority`
- `prisma`, `@prisma/client`, `mongodb`

---

## Créditos y autores

- [@Hhazan01](https://github.com/hhazan01)
- [@Probuho](https://github.com/probuho)

---

## Notas finales

- Esta versión es un snapshot funcional y estable al **27/06/2025**.
- Para nuevas funcionalidades, crear ramas y pull requests.
- ¡Explora, aprende y contribuye!
