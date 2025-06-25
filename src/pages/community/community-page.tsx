import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { verifiedSightings } from "./data";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "@/components/context/auth-context";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCommunity } from "@/hooks/useCommunity";
import { Input } from "@/components/ui/input";

export default function CommunityPage() {
  const { session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { temas, loading } = useCommunity();
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Función para manejar intentos de interacción de invitados
  const handleGuestAction = () => {
    if (!session) setShowModal(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <Label className="text-3xl">Foro de la Comunidad</Label>
      <Card className="bg-slate-100">
        <CardHeader>
          <span className="w-4 h-4 text-2xl">👁️</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label>VERIFICADO POR LA COMUNIDAD</Label>
          <span>Resumen de Avistamientos Verificados</span>
          <p className="text-muted-foreground">
            Observaciones recientes de vida silvestre verificadas por nuestra
            red de exploradores.
          </p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {verifiedSightings.map((item) => (
          <Card key={item.id} className="bg-slate-100">
            <CardHeader>
              <span className="text-4xl h-8 w-8">{item.icon}</span>
            </CardHeader>
            <CardContent className="flex-1">
              <CardTitle>{item.title}</CardTitle>
              <span className="text-muted-foreground">{item.description}</span>
              <div className="ml-auto">
                <Button type="button" asChild onClick={handleGuestAction}>
                  <Link to={item.action.link}>{item.action.text}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Formulario para crear tema */}
      {session && (
        <form
          className="flex flex-col gap-2 p-4 border border-slate-200 bg-white rounded mb-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setEnviando(true);
            setError("");
            setExito("");
            try {
              const body = { titulo, contenido };
              // No enviar comunidadId si no hay selección
              const res = await fetch("http://localhost:3001/community/temas", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.token}`,
                },
                body: JSON.stringify(body),
              });
              if (!res.ok) throw new Error("Error al crear el tema");
              setTitulo("");
              setContenido("");
              setExito("¡Tema creado!");
              window.location.reload();
            } catch (err) {
              setError("No se pudo crear el tema. Intenta de nuevo.");
            } finally {
              setEnviando(false);
            }
          }}
        >
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" value={titulo} onChange={e => setTitulo(e.target.value)} required disabled={enviando} />
          <Label htmlFor="contenido">Contenido</Label>
          <Input id="contenido" value={contenido} onChange={e => setContenido(e.target.value)} required disabled={enviando} />
          <Button type="submit" disabled={enviando || !titulo || !contenido}>
            {enviando ? "Creando..." : "Crear tema"}
          </Button>
          {error && <span className="text-red-500 text-xs">{error}</span>}
          {exito && <span className="text-green-600 text-xs">{exito}</span>}
        </form>
      )}
      {/* Temas de la comunidad */}
      <div className="mt-4">
        <Label className="text-xl">Temas de la comunidad</Label>
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando temas...</p>
        ) : temas.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay temas aún. ¡Sé el primero en crear uno!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {temas.map((tema) => (
              <Card key={tema.id} className="bg-white border border-slate-200">
                <CardHeader>
                  <CardTitle>{tema.titulo}</CardTitle>
                  <span className="text-xs text-muted-foreground">por {tema.autor?.nickname || "Anónimo"} en {tema.comunidad?.nombre || "Comunidad"}</span>
                </CardHeader>
                <CardContent>
                  <p>{tema.contenido}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Respuestas: {tema.respuestas?.length || 0}</span>
                    <span>Votos: {tema.likes || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Modal para invitados */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Únete a la comunidad!</DialogTitle>
          </DialogHeader>
          <p className="text-center">Para interactuar o ver perfiles necesitas registrarte o iniciar sesión.<br/>¿Ya tienes cuenta? Inicia sesión o regístrate gratis.</p>
          <DialogFooter className="flex justify-center gap-4">
            <Button onClick={() => navigate("/login")}>Iniciar sesión</Button>
            <Button variant="secondary" onClick={() => navigate("/register")}>Registrarse</Button>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
