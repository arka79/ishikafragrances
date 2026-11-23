import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, firebaseReady } from '../lib/firebase.js';
import { validateCatalogue } from '../../shared/catalogue.js';

const catalogueRef = () => doc(db, 'site', 'catalogue');

function cleanProducts(products) {
  return products.map((product) => ({
    id: product.id,
    no: String(product.no).trim(),
    name: product.name.trim(),
    price: product.price,
    category: product.category,
  }));
}

function readSnapshot(snapshot) {
  if (!snapshot.exists()) {
    return { products: null, updatedAt: null, configured: true };
  }

  const data = snapshot.data();
  const products = Array.isArray(data.products)
    ? data.products.map((product) => ({
        id: Number(product.id),
        no: String(product.no ?? ''),
        name: String(product.name ?? ''),
        price: Number(product.price),
        category: String(product.category ?? ''),
      }))
    : null;

  const check = validateCatalogue(products);
  if (!check.ok) {
    throw new Error(`The published catalogue is invalid: ${check.error}`);
  }

  return {
    products,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
    configured: true,
  };
}

/** Reads the public catalogue. Returns products: null before the first publish. */
export async function fetchLiveCatalogue() {
  if (!firebaseReady) {
    return { products: null, updatedAt: null, configured: false };
  }
  const snapshot = await getDoc(catalogueRef());
  return readSnapshot(snapshot);
}

/**
 * Writes the whole catalogue in one atomic document update. Firestore rules
 * reject this unless the caller is the configured owner account.
 */
export async function publishCatalogue(products) {
  if (!firebaseReady) {
    throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* values to .env.');
  }

  const check = validateCatalogue(products);
  if (!check.ok) {
    throw new Error(check.error);
  }

  const ref = catalogueRef();
  await setDoc(ref, {
    products: cleanProducts(products),
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(ref);
  return readSnapshot(snapshot);
}
