import { useQuery } from '@tanstack/react-query';
import { api, Catalog, Reel } from './api';

export function useDiscovery() {
  return useQuery({ queryKey: ['discovery'], queryFn: async () => {
    const [reels, catalog] = await Promise.all([api<Reel[]>('/reels'), api<Catalog>('/catalog')]);
    const featured = new Set(reels.map(r => r.product.id));
    const ids = ['f4', 'b2', 'p1', 'sneak1', 'f5', 'audio1', 'p3', 'h2', 'a3'];
    const photos: Reel[] = ids.flatMap(id => {
      const product = catalog.products.find(p => p.id === id);
      if (!product || featured.has(id)) return [];
      const brand = catalog.brands.find(b => b.id === product.brand_id);
      return [{ id: `photo-${id}`, video: '', video_web: '', product, caption: `${product.name}. A little find for your everyday.`, creator: brand?.name || 'OneCity Fresh', likes: 0, tag: 'Catalogue photo', brand: brand || { id: product.store_id, name: 'OneCity Fresh', department: product.department || 'grocery', logo: '', image: product.image, tagline: 'Your local finds' } }];
    });
    return [...reels, ...photos];
  }, retry: 1 });
}