import React from "react";
import { User as UserIcon, Award, Users, Edit, Bookmark, MessageCircle, Heart, CheckCircle } from "lucide-react";
import axios from "axios";
import { useSession } from "@/components/context/auth-context";
import { useRoadmap } from "@/hooks/useRoadmap";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function ProfilePage() {
  const { session } = useSession();
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { roadmap, loading: loadingRoadmap } = useRoadmap();

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.token) return;
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3001/user/profile", {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        setUser(res.data);
        setError(null);
      } catch (err: any) {
        setError("No se pudo cargar el perfil. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  if (loading) return <div className="text-center py-10">Cargando perfil...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!user) return null;

  // Ejemplo de adaptación visual, puedes mejorar los iconos según los datos reales
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <span className="hover:underline cursor-pointer">Inicio</span> {'>'} <span className="font-semibold text-gray-700">Mi Perfil</span>
      </nav>

      {/* Cabecera del perfil */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Tarjeta de usuario */}
        <div className="flex-1 bg-violet-50 rounded-2xl p-6 flex flex-col gap-2 shadow">
          <div className="flex items-center gap-3">
            <img src={user.avatarUrl || user.image || "/avatars/default.png"} alt="avatar" className="w-12 h-12 rounded-full border-2 border-violet-400 bg-white object-cover" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.nombre || user.name}</h2>
              <div className="text-gray-500 text-sm">Nivel {user.nivel || 1} • Miembro desde {new Date(user.miembroDesde || user.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="mt-2 text-gray-600 text-sm">
            <span className="font-semibold">Grupos:</span> {user.comunidades?.map((g: any) => g.comunidad?.nombre || g.nombre).join(", ")}
          </div>
        </div>
        {/* Tarjeta de logros/nivel */}
        <div className="flex-1 bg-violet-50 rounded-2xl p-6 flex flex-col gap-2 shadow items-center justify-center">
          <div className="text-xs text-gray-500 uppercase">Logros</div>
          <div className="text-lg font-bold text-gray-800">Nivel {user.nivel || 1}</div>
          <div className="text-gray-500 text-sm">{user.puntos || 0} puntos</div>
          <button className="mt-2 px-4 py-2 bg-violet-500 text-white rounded-lg font-semibold hover:bg-violet-600 transition">Ver Insignias</button>
        </div>
        {/* Botón editar perfil */}
        <div className="flex items-start">
          <button className="ml-auto px-4 py-2 bg-violet-500 text-white rounded-lg font-semibold hover:bg-violet-600 transition flex items-center gap-2">
            <Edit size={18} /> Editar Perfil
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 flex gap-6 overflow-x-auto">
        <button className="py-2 px-4 font-semibold text-violet-600 border-b-2 border-violet-600 bg-violet-50 rounded-t">Aportes</button>
        <button className="py-2 px-4 text-gray-600 hover:text-violet-600">Réplicas</button>
        <button className="py-2 px-4 text-gray-600 hover:text-violet-600">Guardados</button>
        <button className="py-2 px-4 text-gray-600 hover:text-violet-600">Configuración</button>
      </div>

      {/* Aportes del usuario */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">Mis aportes</h3>
        <div className="flex flex-col gap-3">
          {user.aportes?.map((a: any, i: number) => (
            <div key={i} className="flex items-center bg-white rounded-xl shadow p-4 gap-4">
              <Award className="text-violet-400" size={24} />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{a.titulo}</div>
                <div className="text-xs text-gray-500">{new Date(a.fecha).toLocaleDateString()} • {a.comentarios || 0} comentarios • {a.likes || 0} me gusta</div>
              </div>
              <button className="text-gray-400 hover:text-violet-500"><Edit size={18} /></button>
              <button className="text-gray-400 hover:text-red-500"><Bookmark size={18} /></button>
            </div>
          ))}
        </div>
      </section>

      {/* Actividad reciente */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">Actividad reciente</h3>
        <div className="flex flex-col gap-2">
          {user.actividad?.map((act: any, i: number) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-lg shadow p-3">
              <span className="text-violet-400"><MessageCircle size={18} /></span>
              <span className="flex-1 text-gray-700 text-sm">{act.descripcion}</span>
              <span className="text-xs text-gray-400">{new Date(act.fecha).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap de logros */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">Progreso de logros</h3>
        {loadingRoadmap ? (
          <div>Cargando roadmap...</div>
        ) : (
          roadmap.map((logro, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{logro.nombre}</span>
                <span>{logro.progreso}%</span>
              </div>
              <ProgressBar progreso={logro.progreso} />
              <div className="text-xs text-gray-500">{logro.descripcion}</div>
            </div>
          ))
        )}
      </section>

      {/* Insignias y logros */}
      <section>
        <h3 className="text-lg font-bold mb-4">Insignias y logros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user.logros?.map((l: any, i: number) => (
            <div key={i} className="bg-violet-50 rounded-xl p-4 flex flex-col items-center shadow">
              <span className="mb-2 text-violet-500"><Award size={28} /></span>
              <div className="font-semibold text-gray-800">{l.logro?.nombre || l.nombre}</div>
              <div className="text-xs text-gray-500 text-center">{l.logro?.descripcion || l.descripcion}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Grupos/comunidades */}
      <section className="mt-8">
        <h3 className="text-lg font-bold mb-4">Comunidades</h3>
        <div className="flex flex-wrap gap-3">
          {user.comunidades?.map((g: any, i: number) => (
            <div key={i} className="bg-white rounded-lg shadow px-4 py-2 flex items-center gap-2">
              <Users className="text-violet-400" size={20} />
              <span className="font-semibold text-gray-700">{g.comunidad?.nombre || g.nombre}</span>
              <span className="text-xs text-gray-500">({g.rol})</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 