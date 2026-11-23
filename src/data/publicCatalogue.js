import { validateCatalogue } from '../../shared/catalogue.js';

// The public page reads the same Firestore document as the admin panel, but
// over the REST API so visitors do not download the whole Firebase SDK.
// Firestore security rules still apply to this request; the API key is a
// public web-app identifier, not a secret.

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

function decodeValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) {
    return (value.arrayValue.values ?? []).map(decodeValue);
  }
  if ('mapValue' in value) {
    return decodeFields(value.mapValue.fields);
  }
  return null;
}

function decodeFields(fields) {
  return Object.fromEntries(
    Object.entries(fields ?? {}).map(([key, value]) => [key, decodeValue(value)])
  );
}

export async function fetchPublicCatalogue() {
  if (!projectId || !apiKey) {
    return { products: null, updatedAt: null, configured: false };
  }

  const url =
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}` +
    `/databases/(default)/documents/site/catalogue?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, { cache: 'no-cache' });

  if (response.status === 404) {
    // Nothing published yet — the caller falls back to the bundled catalogue.
    return { products: null, updatedAt: null, configured: true };
  }
  if (!response.ok) {
    throw new Error(`Could not read the live catalogue (HTTP ${response.status}).`);
  }

  const payload = await response.json();
  const data = decodeFields(payload.fields);

  const products = Array.isArray(data.products)
    ? data.products.map((product) => ({
        id: Number(product?.id),
        no: String(product?.no ?? ''),
        name: String(product?.name ?? ''),
        price: Number(product?.price),
        category: String(product?.category ?? ''),
      }))
    : null;

  const check = validateCatalogue(products);
  if (!check.ok) {
    throw new Error(`The published catalogue is invalid: ${check.error}`);
  }

  return {
    products,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
    configured: true,
  };
}
