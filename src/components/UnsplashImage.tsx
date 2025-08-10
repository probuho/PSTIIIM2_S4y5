import React, { useState, useEffect } from 'react';
import { getAnimalImage, getPlaceImage } from '../lib/unsplash-config';

interface UnsplashImageProps {
  query: string;
  type: 'animal' | 'place';
  fallbackImage?: string;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
}

/**
 * COMPONENTE UNSPLASH IMAGE
 * 
 * Este componente carga imágenes dinámicamente desde la API de Unsplash
 * y las muestra en la aplicación. Es útil para obtener imágenes frescas
 * y de alta calidad de animales y lugares.
 */
const UnsplashImage: React.FC<UnsplashImageProps> = ({
  query,
  type,
  fallbackImage,
  className = '',
  alt = '',
  width = 400,
  height = 300,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Obtener imagen según el tipo
        let url: string;
        if (type === 'animal') {
          url = await getAnimalImage(query);
        } else {
          url = await getPlaceImage(query);
        }

        if (url) {
          setImageUrl(url);
        } else {
          throw new Error('No se pudo obtener la imagen');
        }
      } catch (err) {
        console.error(`Error al cargar imagen de ${query}:`, err);
        setError(true);
        
        // Usar imagen de respaldo si está disponible
        if (fallbackImage) {
          setImageUrl(fallbackImage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [query, type, fallbackImage]);

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height }}
      >
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500">Cargando imagen...</span>
        </div>
      </div>
    );
  }

  if (error && !fallbackImage) {
    return (
      <div 
        className={`bg-red-100 border border-red-300 ${className}`}
        style={{ width, height }}
      >
        <div className="flex items-center justify-center h-full">
          <span className="text-red-500">Error al cargar imagen</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt || `Imagen de ${query}`}
      className={className}
      style={{ width, height }}
      onError={() => {
        setError(true);
        if (fallbackImage) {
          setImageUrl(fallbackImage);
        }
      }}
    />
  );
};

export default UnsplashImage; 