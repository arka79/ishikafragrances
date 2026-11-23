import { PRODUCTS } from '../data/products.js';
import { CATEGORIES, FAMILIES, validateCatalogue } from '../../shared/catalogue.js';

export { FAMILIES, validateCatalogue };

export const FAMILY_MAP = new Map(FAMILIES.map((category) => [category.key, category]));

export const FAMILY_TONES = {
  floral: '#b06a85',
  woody: '#8a6a4a',
  amber: '#b08a4f',
  devotional: '#8c3a3f',
  fruity: '#b5705a',
};

export const familyLabel = (key) => FAMILY_MAP.get(key)?.label ?? key;

export const cloneBase = () => PRODUCTS.map((product) => ({ ...product }));

export const nextId = (products) =>
  products.reduce((max, product) => Math.max(max, Number(product.id) || 0), 0) + 1;

export const nextNo = (products) => {
  const max = products.reduce((highest, product) => {
    const value = Number.parseInt(String(product.no).replace(/\D/g, ''), 10);
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return String(max + 1).padStart(2, '0');
};

/* ---------- imports ---------- */

function normaliseFamily(value) {
  const input = String(value ?? '')
    .trim()
    .toLowerCase();

  const byKey = FAMILIES.find((category) => category.key === input);
  if (byKey) return byKey.key;

  const byLabel = FAMILIES.find((category) => category.label.toLowerCase() === input);
  return byLabel ? byLabel.key : null;
}

function parsePrice(value) {
  const cleaned = String(value ?? '').replace(/[^\d.]/g, '');
  if (!cleaned) return null;
  const price = Number(cleaned);
  return Number.isInteger(price) && price > 0 ? price : null;
}

function normaliseImportedRow(raw, existing) {
  const name = String(raw?.name ?? '')
    .trim()
    .replace(/\s+/g, ' ');

  if (!name) return { error: 'fragrance name is missing' };
  if (name.length > 80) return { error: `"${name.slice(0, 30)}…" is too long` };

  let no = String(raw?.no ?? '').trim();
  if (!no) {
    no = String(existing.length + 1).padStart(2, '0');
  } else if (/^\d+$/.test(no)) {
    no = no.padStart(2, '0');
  }

  if (no.length > 10) return { error: 'catalogue number is too long' };
  if (existing.some((product) => product.no.toLowerCase() === no.toLowerCase())) {
    return { error: `catalogue number "${no}" is used twice` };
  }

  const price = parsePrice(raw?.price);
  if (price === null) {
    return {
      error: `price must be a positive whole number (got "${String(raw?.price ?? '').trim()}")`,
    };
  }

  const category = normaliseFamily(raw?.category);
  if (!category) {
    return {
      error: `unknown family "${String(raw?.category ?? '').trim() || '(blank)'}" — use floral, woody, amber, devotional or fruity`,
    };
  }

  return { product: { id: 0, no, name, price, category } };
}

function finaliseImported(products, errors) {
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  if (products.length === 0) {
    return { ok: false, error: 'No product rows were found in that file.' };
  }

  const withIds = products.map((product, index) => ({ ...product, id: index + 1 }));
  const check = validateCatalogue(withIds);
  if (!check.ok) return check;

  return { ok: true, products: withIds };
}

const HEADER_ALIASES = [
  { field: 'no', names: ['no', 'number', 'catno', 'catalogeno', 'sno', 'code'] },
  {
    field: 'name',
    names: [
      'name',
      'fragrance',
      'fragrancename',
      'nameoffragrance',
      'product',
      'productname',
      'scent',
      'scentname',
    ],
  },
  {
    field: 'price',
    names: ['price', 'pricekg', 'priceperkg', 'rate', 'rupees', 'amount'],
  },
  {
    field: 'category',
    names: ['category', 'family', 'fragrancefamily', 'type'],
  },
];

function fieldForHeader(header) {
  const normalised = String(header ?? '')
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  return HEADER_ALIASES.find((entry) => entry.names.includes(normalised))?.field ?? null;
}

function tokeniseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let fieldStarted = false;
  let unclosedQuote = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && !fieldStarted) {
      inQuotes = true;
      fieldStarted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
      fieldStarted = false;
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      fieldStarted = false;
    } else if (char === '\r') {
      // Ignore CR; handles CRLF and old Mac line endings when followed by LF.
    } else {
      field += char;
      fieldStarted = true;
    }
  }

  if (inQuotes) unclosedQuote = true;
  if (field.length > 0 || fieldStarted || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return { rows, unclosedQuote };
}

export function parseCsv(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return { ok: false, error: 'That file is empty.' };
  }

  const { rows, unclosedQuote } = tokeniseCsv(text);
  if (unclosedQuote) {
    return { ok: false, error: 'That CSV has an unclosed quote.' };
  }
  if (rows.length < 2) {
    return { ok: false, error: 'That CSV needs a header row and at least one product.' };
  }

  const header = rows[0];
  const columns = {};
  header.forEach((cell, index) => {
    const field = fieldForHeader(cell);
    if (field && columns[field] === undefined) columns[field] = index;
  });

  const missing = ['no', 'name', 'price', 'category'].filter(
    (field) => columns[field] === undefined
  );
  if (missing.length > 0) {
    return {
      ok: false,
      error: `The CSV is missing these columns: ${missing.join(', ')}. Use the exported CSV as a template.`,
    };
  }

  const products = [];
  const errors = [];

  for (let index = 1; index < rows.length; index += 1) {
    const cells = rows[index];
    if (cells.every((cell) => !String(cell).trim())) continue;

    const result = normaliseImportedRow(
      {
        no: cells[columns.no],
        name: cells[columns.name],
        price: cells[columns.price],
        category: cells[columns.category],
      },
      products
    );

    if (result.error) {
      errors.push(`Row ${index + 1}: ${result.error}`);
    } else {
      products.push(result.product);
    }
  }

  return finaliseImported(products, errors);
}

export function parseJson(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: 'That file is not valid JSON.' };
  }

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.products)
      ? data.products
      : null;

  if (!list) {
    return { ok: false, error: 'Expected an array of products or an object with a "products" array.' };
  }
  if (list.length === 0) {
    return { ok: false, error: 'That file contains no products.' };
  }
  if (list.length > 1000) {
    return { ok: false, error: 'The catalogue cannot contain more than 1,000 products.' };
  }

  const products = [];
  const errors = [];

  list.forEach((raw, index) => {
    const result = normaliseImportedRow(raw, products);
    if (result.error) {
      errors.push(`Product ${index + 1}: ${result.error}`);
    } else {
      products.push(result.product);
    }
  });

  return finaliseImported(products, errors);
}

/* ---------- exports ---------- */

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(products) {
  const rows = [
    ['no', 'name', 'price', 'category'],
    ...products.map((product) => [product.no, product.name, product.price, product.category]),
  ];
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export function toJson(products) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      products,
      categories: CATEGORIES,
    },
    null,
    2
  );
}

export function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
