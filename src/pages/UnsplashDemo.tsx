import React, { useState } from 'react';
import { searchUnsplashPhotos } from '../lib/unsplash-config';

/**
 * PÁGINA DE DEMOSTRACIÓN DE UNSPLASH API
 * 
 * Esta página muestra cómo usar la API de Unsplash para obtener
 * imágenes dinámicas de animales y lugares en el proyecto.
 */
const UnsplashDemo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Función para buscar imágenes
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchUnsplashPhotos(searchQuery, 6);
      setSearchResults(results);
      console.log('Resultados de búsqueda:', results);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Título principal */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          🖼️ Demostración de Unsplash API
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explora cómo integrar imágenes de alta calidad de animales y lugares naturales 
          en tu proyecto usando la API de Unsplash.
        </p>
      </div>

      {/* Sección de prueba de conexión */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          ✅ Prueba de Conexión
        </h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            La página se está cargando correctamente. La API de Unsplash está configurada y lista para usar.
          </p>
        </div>
      </section>

      {/* Sección de búsqueda de imágenes */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          🔍 Búsqueda de Imágenes
        </h2>
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar imágenes (ej: tiger, forest, ocean, panda)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((photo, index) => (
                <div key={index} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={`${photo.urls.regular}?w=400&h=300&fit=crop`}
                    alt={photo.alt_description || 'Imagen de Unsplash'}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm text-gray-600 font-medium">
                      Por: {photo.user?.name || 'Desconocido'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {photo.description || 'Sin descripción'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sección de ejemplos de imágenes */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          🦁 Ejemplos de Imágenes de Animales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&h=300&fit=crop"
              alt="Leopardo de Amur"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">Leopardo de Amur</h3>
              <p className="text-sm text-gray-600 mt-1">Menos de 100 individuos en libertad</p>
              <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                En peligro crítico
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1549366021-9f761d450615?w=400&h=300&fit=crop"
              alt="Gorila de Montaña"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">Gorila de Montaña</h3>
              <p className="text-sm text-gray-600 mt-1">En peligro crítico</p>
              <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                En peligro crítico
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
              alt="Delfín"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">Delfín</h3>
              <p className="text-sm text-gray-600 mt-1">Mamífero marino inteligente</p>
              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Vulnerable
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de información de la API */}
      <section className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          ℹ️ Información sobre Unsplash API
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700"><strong>Límite gratuito:</strong> 5,000 solicitudes por hora</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700"><strong>Calidad:</strong> Imágenes de alta resolución</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700"><strong>Atribución:</strong> Requerida para uso comercial</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700"><strong>Búsqueda:</strong> Por palabras clave en inglés</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de uso en el proyecto */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          🚀 Cómo usar en tu proyecto
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 mb-3">
            La API de Unsplash está configurada y lista para usar en cualquier parte del proyecto:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>Juego de Memoria:</strong> Imágenes frescas de animales en cada partida</li>
            <li>• <strong>Módulo de Especies:</strong> Fotos de alta calidad de hábitats naturales</li>
            <li>• <strong>Galería de Avistamientos:</strong> Imágenes dinámicas de lugares</li>
            <li>• <strong>Contenido Educativo:</strong> Visuales actualizados automáticamente</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default UnsplashDemo; 