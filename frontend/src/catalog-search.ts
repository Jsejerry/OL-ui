import { Catalog, Product } from './api';
const intents: Record<string, string[]> = {
  care: ['pharmacy', 'beauty'], 'personal care': ['pharmacy', 'beauty'], 'pharmacy beauty': ['pharmacy', 'beauty'],
  pharmacy: ['pharmacy'], beauty: ['beauty'], shopping: ['shops'], shop: ['shops'], shops: ['shops'],
  groceries: ['grocery'], grocery: ['grocery'], supermarket: ['grocery'], food: ['food'],
};
export function normaliseQuery(text: string) { return text.toLowerCase().replace(/[&’']/g, ' ').replace(/\s+/g, ' ').trim(); }
export function matchesProductQuery(product: Product, query: string, catalog: Catalog) {
  const text = normaliseQuery(query);
  if (!text) return true;
  if (intents[text]) return intents[text].includes(product.department || 'grocery');
  const category = catalog.categories.find(c => c.id === product.category_id)?.name || '';
  const brand = catalog.brands.find(b => b.id === product.brand_id)?.name || '';
  const haystack = normaliseQuery(`${product.name} ${product.weight} ${category} ${brand}`);
  return text.split(' ').every(word => haystack.includes(word));
}