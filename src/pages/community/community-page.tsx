import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { verifiedSightings } from "./data";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "@/components/context/auth-context";
import React, { useState } from "react";
import { useCommunity } from "@/hooks/useCommunity";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Inset } from "@radix-ui/themes";
import { ImageOff } from "lucide-react";

export default function CommunityPage() {
  const { session } = useSession();
  const navigate = useNavigate();
  const { temas, loading } = useCommunity();
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Estado para el modal de avistamiento
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [loadingModal, setLoadingModal] = useState(false);

  // Función para abrir el modal y buscar info en Wikipedia
  const handleOpenModal = async (item: any) => {
    setOpenModal(true);
    setLoadingModal(true);
    // Buscar en Wikipedia por el título del avistamiento
    try {
      const searchTitle = encodeURIComponent(item.title);
      const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${searchTitle}`);
      const data = await res.json();
      setModalData({
        title: item.title,
        icon: item.icon,
        image: data.thumbnail?.source || null,
        extract: data.extract || "No se encontró información en Wikipedia.",
        wikiUrl: data.content_urls?.desktop?.page || `https://es.wikipedia.org/wiki/${searchTitle}`,
      });
    } catch (e) {
      setModalData({
        title: item.title,
        icon: item.icon,
        image: null,
        extract: "No se pudo obtener información de Wikipedia.",
        wikiUrl: `https://es.wikipedia.org/wiki/${item.title}`,
      });
    } finally {
      setLoadingModal(false);
    }
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
              <Inset>
                {item.image ? (
                  <img src={item.image} alt={item.title} className="rounded w-full h-40 object-cover mb-2" />
                ) : (
                  <div className="flex items-center justify-center w-full h-40 bg-slate-200 rounded mb-2">
                    <ImageOff className="text-slate-400 w-10 h-10" />
                  </div>
                )}
                <span className="text-muted-foreground">{item.description}</span>
                <div className="flex gap-2 mt-2">
                  <Button type="button" asChild>
                    <Link to={item.action.link}>{item.action.text}</Link>
                  </Button>
                </div>
              </Inset>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de avistamiento */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {modalData?.icon} {modalData?.title}
            </DialogTitle>
          </DialogHeader>
          {loadingModal ? (
            <div className="text-center py-8">Cargando información...</div>
          ) : modalData && (
            <div className="flex flex-col items-center gap-4">
              {modalData.image && <img src={modalData.image} alt={modalData.title} className="rounded w-40 h-40 object-cover" />}
              <p className="text-center text-sm text-muted-foreground">{modalData.extract}</p>
              <Button asChild variant="outline" className="mt-2">
                <a href={modalData.wikiUrl} target="_blank" rel="noopener noreferrer">Ver en Wikipedia</a>
              </Button>
              <Button asChild className="mt-2">
                <Link to={"/sightings/" + (modalData?.title?.toLowerCase().replace(/ /g, "_"))}>Ver módulo de avistamientos</Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="temas" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="temas">Todos los temas</TabsTrigger>
          <TabsTrigger value="discusiones">Discusiones</TabsTrigger>
          <TabsTrigger value="preguntas">Preguntas</TabsTrigger>
          <TabsTrigger value="wiki">Wiki</TabsTrigger>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="guias">Guías</TabsTrigger>
        </TabsList>
        <TabsContent value="temas">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Todos los temas</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Aquí se mostrarán todos los temas de la comunidad.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="discusiones">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Discusiones</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Contenido de la pestaña de discusiones.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preguntas">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Preguntas</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Contenido de la pestaña de preguntas.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="wiki">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Wiki</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Contenido de la pestaña de wiki.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="eventos">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Contenido de la pestaña de eventos.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="guias">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Guías</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Contenido de la pestaña de guías.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </div>
  );
}
