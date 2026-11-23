import { ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useCatalogue } from '../data/CatalogueContext.jsx';
import productImage from '../images/product.jpg';

const WHATSAPP = 'https://wa.me/917872308154';

const TICKER_NAMES = [
  'Bela',
  'Champa',
  'Mogra',
  'Sandalwood',
  'Amber',
  'Kesar Chandan',
  'Lavender',
  'Black Rose',
  'Kasturi',
  'Tulsi Chandan',
  'Musk',
  'Oudh',
  '45+ blends',
];

const Seal = () => (
  <svg className="stage__seal" viewBox="0 0 120 120" aria-hidden="true">
    <defs>
      <path
        id="sealCircle"
        d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0"
      />
    </defs>
    <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeOpacity="0.4" />
    <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" strokeOpacity="0.3" />
    <text>
      <textPath href="#sealCircle">Handcrafted in East Medinipur · West Bengal ·</textPath>
    </text>
    <text className="seal-mono" x="60" y="68" textAnchor="middle">
      IF
    </text>
  </svg>
);

const Hero = () => {
  const { products } = useCatalogue();
  const featured = products.find((p) => p.name === 'Khasab & Oudh') || products[0];
  const lowestPrice = products.reduce(
    (lowest, product) => Math.min(lowest, product.price),
    Infinity
  );

  return (
    <section className="hero" id="top">
      <div className="shell">
        <div className="hero__grid">
          <div className="hero__copy fade-in">
            <p className="eyebrow">Agarbatti fragrance manufacturer · East Medinipur</p>

            <h1 className="hero__title">
              The fragrance
              <br />
              behind <em>the incense.</em>
            </h1>

            <p className="hero__lede">
              Welcome to Ishika Fragrances
​At Ishika Fragrances, we believe that a great fragrance does more than scent a space—it creates an atmosphere, evokes emotion, and leaves a lasting impression. We are proud to be a trusted supplier of premium quality agarbatti fragrance oils, crafted to elevate your incense products and set your brand apart in the market.
            </p>

            <div className="hero__actions">
              <a href="#products" className="btn btn--solid">
                View price list
                <ArrowRight size={15} strokeWidth={2} />
              </a>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost"
              >
                <FaWhatsapp size={16} />
                WhatsApp us
              </a>
            </div>

            <ul className="hero__meta">
              <li>
                <strong>{products.length}+</strong> signature fragrances
              </li>
              <li>
                <strong>5</strong> fragrance families
              </li>
              <li>
                from{' '}
                <strong>
                  {Number.isFinite(lowestPrice)
                    ? `₹${lowestPrice.toLocaleString('en-IN')}`
                    : '—'}
                </strong>{' '}
                per kg
              </li>
            </ul>
          </div>

          <div className="hero__stage fade-in stagger-2">
            <div className="stage__arch">
              <img
                className="stage__photo"
                src={productImage}
                alt="Khasab & Oudh agarbatti fragrance compound in a bottle"
                width="960"
                height="1028"
              />
            </div>

            <Seal />

            <div className="stage__card">
              <p className="stage__card-kicker">From the catalogue</p>
              <p className="stage__card-name">
                No. {featured.no} — {featured.name}
              </p>
              <p className="stage__card-price">
                ₹{featured.price.toLocaleString('en-IN')}
                <span>per kg</span>
              </p>
            </div>

            <span className="stage__vertical">Per-kg pricing, always in the open</span>
          </div>
        </div>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {[...TICKER_NAMES, ...TICKER_NAMES].map((name, i) => (
            <span className="ticker__item" key={`${name}-${i}`}>
              {name}
              <span className="ticker__dot" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
