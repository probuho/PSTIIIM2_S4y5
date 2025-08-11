import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/lib/config";

// Tipo para la sesión del usuario
export interface AuthSession {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}

// Hook para manejar la sesión de AuthJS
export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener la sesión actual
  const getSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.AUTH_SESSION, {
        method: "GET",
        credentials: "include", // Importante para cookies
      });

      if (response.ok) {
        const sessionData = await response.json();
        setSession(sessionData);
      } else {
        setSession(null);
      }
    } catch (err) {
      setError("Error al obtener la sesión");
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(API_ENDPOINTS.AUTH_SIGNOUT, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setSession(null);
        // Redirigir al login
        window.location.href = "/login";
      }
    } catch (err) {
      setError("Error al cerrar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return session?.user?.id !== undefined;
  };

  // Función para obtener el ID del usuario
  const getUserId = () => {
    return session?.user?.id;
  };

  // Función para obtener el nombre del usuario
  const getUserName = () => {
    return session?.user?.name || "Usuario";
  };

  // Función para obtener el email del usuario
  const getUserEmail = () => {
    return session?.user?.email;
  };

  // Función para obtener la imagen del usuario
  const getUserImage = () => {
    return session?.user?.image;
  };

  // Cargar sesión al montar el componente
  useEffect(() => {
    getSession();
  }, []);

  // Función para refrescar la sesión
  const refreshSession = () => {
    getSession();
  };

  return {
    session,
    loading,
    error,
    isAuthenticated,
    getUserId,
    getUserName,
    getUserEmail,
    getUserImage,
    signOut,
    refreshSession,
    getSession,
  };
}
