import React from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Calendar, Shield, LogOut } from "lucide-react";

export function SessionStatusPage() {
  const {
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
  } = useAuthSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error de Sesión</CardTitle>
            <CardDescription>No se pudo verificar el estado de la sesión</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={refreshSession} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Estado de Sesión
            </CardTitle>
            <CardDescription className="text-lg">
              Información detallada de tu sesión actual
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Estado de autenticación */}
            <div className="text-center">
              <Badge
                variant={isAuthenticated() ? "default" : "secondary"}
                className={`text-lg px-4 py-2 ${
                  isAuthenticated()
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
                }`}
              >
                {isAuthenticated() ? "✅ Autenticado" : "❌ No autenticado"}
              </Badge>
            </div>

            {isAuthenticated() ? (
              <>
                {/* Información del usuario */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Información del Usuario
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        ID de Usuario
                      </label>
                      <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                        {getUserId()}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Nombre
                      </label>
                      <p className="text-sm text-gray-900">
                        {getUserName()}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Email
                      </label>
                      <p className="text-sm text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {getUserEmail() || "No disponible"}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Imagen de Perfil
                      </label>
                      <p className="text-sm text-gray-900">
                        {getUserImage() ? "Disponible" : "No disponible"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalles de la sesión */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Detalles de la Sesión
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Expira
                      </label>
                      <p className="text-sm text-gray-900">
                        {session?.expires ? new Date(session.expires).toLocaleString('es-VE') : "No disponible"}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Tiempo Restante
                      </label>
                      <p className="text-sm text-gray-900">
                        {session?.expires ? (
                          (() => {
                            const expires = new Date(session.expires);
                            const now = new Date();
                            const diff = expires.getTime() - now.getTime();
                            const minutes = Math.floor(diff / 60000);
                            const seconds = Math.floor((diff % 60000) / 1000);
                            
                            if (diff <= 0) {
                              return "Sesión expirada";
                            }
                            
                            return `${minutes}m ${seconds}s`;
                          })()
                        ) : (
                          "No disponible"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={refreshSession}
                    variant="outline"
                    className="flex-1"
                  >
                    🔄 Refrescar Sesión
                  </Button>
                  
                  <Button
                    onClick={signOut}
                    variant="destructive"
                    className="flex-1"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  No hay una sesión activa. Inicia sesión para continuar.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => window.location.href = "/login"}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    onClick={() => window.location.href = "/register"}
                    variant="outline"
                  >
                    Registrarse
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
