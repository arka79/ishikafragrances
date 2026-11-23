// Catalogue definitions and validation shared by the browser and the server.
// The server is authoritative: it validates every published catalogue with
// validateCatalogue() before writing it to disk.

export const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'grid' },
  { key: 'floral', label: 'Floral', icon: 'flower' },
  { key: 'woody', label: 'Woody', icon: 'leaf' },
  { key: 'amber', label: 'Amber', icon: 'flame' },
  { key: 'devotional', label: 'Devotional', icon: 'star' },
  { key: 'fruity', label: 'Fruity', icon: 'apple' },
];

export const FAMILIES = CATEGORIES.filter((category) => category.key !== 'all');

export const FAMILY_KEYS = new Set(FAMILIES.map((family) => family.key));

export const MAX_PRODUCTS = 1000;

export function validateCatalogue(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return { ok: false, error: 'The catalogue needs at least one product.' };
  }

  if (products.length > MAX_PRODUCTS) {
    return { ok: false, error: `The catalogue cannot contain more than ${MAX_PRODUCTS} products.` };
  }

  const ids = new Set();
  const numbers = new Set();

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const label = `Product ${index + 1}`;

    if (!product || typeof product !== 'object') {
      return { ok: false, error: `${label} is not valid.` };
    }

    if (!Number.isInteger(product.id) || product.id <= 0 || ids.has(product.id)) {
      return { ok: false, error: `${label} has an invalid ID.` };
    }
    ids.add(product.id);

    const name = typeof product.name === 'string' ? product.name.trim() : '';
    if (!name) {
      return { ok: false, error: `${label} needs a fragrance name.` };
    }
    if (name.length > 80) {
      return { ok: false, error: `${label}'s name is too long.` };
    }

    const no = String(product.no ?? '').trim();
    if (!no) {
      return { ok: false, error: `${label} needs a catalogue number.` };
    }
    if (no.length > 10) {
      return { ok: false, error: `${label}'s catalogue number is too long.` };
    }
    const numberKey = no.toLowerCase();
    if (numbers.has(numberKey)) {
      return { ok: false, error: `Catalogue number "${no}" is used twice.` };
    }
    numbers.add(numberKey);

    if (!Number.isInteger(product.price) || product.price <= 0) {
      return { ok: false, error: `${label} needs a positive, whole-number price.` };
    }

    if (!FAMILY_KEYS.has(product.category)) {
      return { ok: false, error: `${label} has an unknown fragrance family.` };
    }
  }

  return { ok: true };
}
