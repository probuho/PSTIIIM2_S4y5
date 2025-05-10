# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Notes - Collaborators

[@Hhazan01](https://github.com/hhazan01)

- Instale-configure la librería de Tailwind CSS.
- Instale-configure la librería de Shadcn e inicialice con la paleta [Slate](https://ui.shadcn.com/colors).
- Cree un nuevo layout (`src\pages\layout.tsx`) para el Navbar, Main y Footer de la aplicacion a partir del modelo original.
- Agregue la logica de manejo de las vistas mediante Routes.
- Cree la vista de [inicio]("http://localhost:5173") (`src\pages\home\home-page.tsx`) y un archivo de datos (`src\pages\home\data.ts`) para el contexto de la vista.

## Components

Para la version `0.0.1` se emplean los siguientes componentes:

```json
# dependencies
"@radix-ui/react-avatar": "^1.1.9", // Shadcn Avatar
"@radix-ui/react-label": "^2.1.6", // Shadcn Label
"@radix-ui/react-navigation-menu": "^1.2.12",
"@radix-ui/react-slot": "^1.2.2",
"@tailwindcss/vite": "^4.1.6",
"class-variance-authority": "^0.7.1",
"clsx": "^2.1.1",
"lucide-react": "^0.509.0",
"react-router-dom": "^7.6.0",
"tailwind-merge": "^3.2.0",
"tailwindcss": "^4.1.6"

# devDependencies
"@types/node": "^22.15.17",
"tw-animate-css": "^1.2.9",
```
