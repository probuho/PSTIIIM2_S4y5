import { useState, useEffect } from 'react';

interface UnsplashImage {
  id: string;
  urls: { regular: string; small: string; };
  alt_description: string;
  user: { name: string; links: { html: string; }; };
}

interface UseUnsplashImageReturn {
  image: UnsplashImage | null;
  loading: boolean;
  error: string | null;
}

// Credenciales de Unsplash (RESPALDADAS)
const UNSPLASH_ACCESS_KEY = '7FkF5_XyctvHJ6T1ELsXgDS7M4SArPI3e0uRVGLiWcY';
const UNSPLASH_APP_ID = '786692';

export function useUnsplashImage(query: string): UseUnsplashImageReturn {
  const [image, setImage] = useState<UnsplashImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    setError(null);
    
    const fetchImage = async () => {
      try {
        // Construir query de búsqueda para animales
        const searchQuery = `${query} animal wildlife nature`;
        
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=1&order_by=relevant`,
          {
            headers: {
              'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
              'Accept-Version': 'v1'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const selectedImage = data.results[0];
          setImage({
            id: selectedImage.id,
            urls: {
              regular: selectedImage.urls.regular,
              small: selectedImage.urls.small
            },
            alt_description: selectedImage.alt_description || `Imagen de ${query}`,
            user: {
              name: selectedImage.user.name,
              links: { html: selectedImage.user.links.html }
            }
          });
        } else {
          // Imagen por defecto si no hay resultados
          setImage({
            id: 'default',
            urls: {
              regular: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
              small: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
            },
            alt_description: `Imagen por defecto de ${query}`,
            user: { name: 'Unsplash', links: { html: 'https://unsplash.com' } }
          });
        }
      } catch (err) {
        console.error('Error fetching Unsplash image:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        
        // Imagen por defecto en caso de error
        setImage({
          id: 'default',
          urls: {
            regular: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
            small: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
          },
          alt_description: `Imagen por defecto de ${query}`,
          user: { name: 'Unsplash', links: { html: 'https://unsplash.com' } }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [query]);

  return { image, loading, error };
}
