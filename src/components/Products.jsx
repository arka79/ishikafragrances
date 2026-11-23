import { useMemo, useState } from 'react';
import { Search, ArrowUpRight, ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { CATEGORIES } from '../data/products.js';
import { useCatalogue } from '../data/CatalogueContext.jsx';

const WHATSAPP_NUMBER = '917872308154';
const EMAIL = 'ishikafragrances@gmail.com';

const CATEGORY_META = {
  floral: { label: 'Floral', tone: '176 106 133' },
  woody: { label: 'Woody', tone: '138 106 74' },
  amber: { label: 'Amber', tone: '176 138 79' },
  devotional: { label: 'Devotional', tone: '140 58 63' },
  fruity: { label: 'Fruity', tone: '181 112 90' },
};

const SORT_OPTIONS = [
  { value: 'default', label: 'Catalogue order' },
  { value: 'low', label: 'Price: low to high' },
  { value: 'high', label: 'Price: high to low' },
];

const SticksMotif = () => (
  <svg className="product__sticks" viewBox="0 0 64 34" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none">
      <path d="M17 30 L23 6" />
      <path d="M31 30 L31 2" />
      <path d="M45 30 L39 8" />
    </g>
    <g fill="currentColor">
      <circle cx="23" cy="5" r="1.4" />
      <circle cx="31" cy="1.7" r="1.4" />
      <circle cx="39" cy="7" r="1.4" />
    </g>
    <path
      d="M12 26 Q31 35 50 26"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.5"
    />
  </svg>
);

const Products = () => {
  const { products } = useCatalogue();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('default');
  const [category, setCategory] = useState('all');

  const categoryCounts = useMemo(
    () =>
      products.reduce(
        (acc, product) => {
          acc[product.category] = (acc[product.category] || 0) + 1;
          return acc;
        },
        { all: products.length }
      ),
    [products]
  );

  const list = useMemo(() => {
    const term = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const label = CATEGORY_META[product.category]?.label ?? product.category;
      const matchesQuery =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.no.includes(term) ||
        label.toLowerCase().includes(term);

      const matchesCategory = category === 'all' || product.category === category;
      return matchesQuery && matchesCategory;
    });

    if (sort === 'low') return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, query, sort, category]);

  const resetFilters = () => {
    setQuery('');
    setCategory('all');
  };

  return (
    <section id="products" className="section section--alt catalogue">
      <div className="shell">
        <div className="section-head fade-in">
          <div>
            <p className="eyebrow">02 / The catalogue</p>
            <h2 className="section-title">
              The fragrance
              <br />
              <em>&amp; price list.</em>
            </h2>
          </div>
          <div className="section-head__aside">
            <p className="lede">
              All prices are in Indian rupees, per kilogram. Search by name, filter by
              fragrance family, or sort to plan your order — nothing is hidden behind a
              “request a quote”.
            </p>
          </div>
        </div>

        <div className="catalogue__bar">
          <div className="search">
            <Search size={16} strokeWidth={1.8} aria-hidden="true" />
            <input
              type="search"
              className="search__input"
              placeholder="Search a fragrance…"
              aria-label="Search fragrances"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="tabs" role="group" aria-label="Fragrance families">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`tab${category === c.key ? ' is-active' : ''}`}
                onClick={() => setCategory(c.key)}
                aria-pressed={category === c.key}
              >
                {c.label}
                <span className="tab__count">{categoryCounts[c.key] || 0}</span>
              </button>
            ))}
          </div>

          <div className="sort">
            <label className="sort__label" htmlFor="catalogue-sort">
              Sort
            </label>
            <select
              id="catalogue-sort"
              className="sort__select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="results">
          <span>
            Showing <strong>{list.length}</strong> of <strong>{products.length}</strong>{' '}
            fragrances
          </span>
          <span>Prices in ₹ · per kilogram</span>
        </div>

        <div className="catalogue__grid">
          {list.length === 0 ? (
            <div className="empty">
              <p className="eyebrow">No matches</p>
              <p className="empty__title">Nothing under that name.</p>
              <p>
                Try another spelling or family — or call{' '}
                <a href="tel:7872308154">7872308154</a> and we will point you to the right
                scent.{' '}
                <button type="button" onClick={resetFilters} className="empty__reset">
                  Clear filters
                </button>
              </p>
            </div>
          ) : (
            list.map((product, index) => {
              const meta = CATEGORY_META[product.category] ?? {
                label: product.category,
                tone: '138 106 74',
              };
              const price = product.price.toLocaleString('en-IN');
              const enquiry = `Hi Ishika Fragrances, I am interested in ${product.name} (₹${price}/kg). Please share MOQ and details.`;

              return (
                <article
                  key={product.id}
                  className="product"
                  style={{
                    '--tone': meta.tone,
                    '--delay': `${Math.min(index, 12) * 30}ms`,
                  }}
                >
                  <div className="product__media">
                    <span className="product__tag">{meta.label}</span>
                    <span className="product__no" aria-hidden="true">
                      {product.no}
                    </span>
                    <SticksMotif />
                  </div>

                  <div className="product__body">
                    <h3 className="product__name">{product.name}</h3>
                    <p className="product__price">
                      ₹{price}
                      <span className="product__price-unit">per kg</span>
                    </p>
                  </div>

                  <div className="product__actions">
                    <a
                      className="product__enquire"
                      href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                        `Enquiry: ${product.name}`
                      )}&body=${encodeURIComponent(enquiry)}`}
                    >
                      Enquire
                      <ArrowUpRight size={13} strokeWidth={2} />
                    </a>
                    <a
                      className="product__wa"
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        enquiry
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Enquire about ${product.name} on WhatsApp`}
                    >
                      <FaWhatsapp size={15} />
                    </a>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="catalogue__foot">
          <p>
            Not sure which scent fits your line? <strong>Talk to the maker.</strong>
          </p>
          <a href="#contact" className="btn btn--ghost btn--sm">
            Ask us
            <ArrowRight size={13} strokeWidth={2} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Products;
