import { Users, Leaf, Check, Star } from 'lucide-react';

const FEATURES = [
  {
    no: '01',
    icon: Users,
    title: 'Direct from the maker',
    text: 'Fragrances manufactured at our own unit — you deal with the source, no middlemen.',
  },
  {
    no: '02',
    icon: Leaf,
    title: 'Natural ingredients',
    text: 'Carefully blended essences: florals, woods, amber, musk and devotional favourites.',
  },
  {
    no: '03',
    icon: Check,
    title: 'Transparent pricing',
    text: 'Every fragrance lists its per-kg price openly, right here on the page.',
  },
  {
    no: '04',
    icon: Star,
    title: '45+ varieties',
    text: 'From Bela and Champa to Sandalwood and Oudh — a scent for every occasion.',
  },
];

const About = () => (
  <section id="about" className="section">
    <div className="shell">
      <div className="section-head fade-in">
        <div>
          <p className="eyebrow">01 / The house</p>
          <h2 className="section-title">
            Made at our own unit,
            <br />
            <em>priced in the open.</em>
          </h2>
        </div>
        <div className="section-head__aside">
          <p className="lede">
            We are a manufacturing unit based in East Medinipur, West Bengal. Our range runs
            from soft florals like Bela, Champa and Jasmine to woody, amber and sandal notes —
            all priced per kilogram so you can plan your orders with ease.
          </p>
        </div>
      </div>

      <div className="story__grid">
        <aside className="story__panel fade-in">
          <p className="eyebrow eyebrow--light">Direct from the maker</p>
          <blockquote className="story__quote">
            “Every fragrance lists its per-kg price <em>openly</em>, right here on the page.”
          </blockquote>
          <p className="story__sign">Ishika Fragrances · East Medinipur</p>
        </aside>

        <ul className="feature-list fade-in stagger-1">
          {FEATURES.map(({ no, icon: Icon, title, text }) => (
            <li className="feature" key={no}>
              <span className="feature__no" aria-hidden="true">
                {no}
              </span>
              <div>
                <h3 className="feature__title">
                  <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
                  {title}
                </h3>
                <p className="feature__text">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="stats fade-in">
        <div className="stat">
          <p className="stat__value">45+</p>
          <p className="stat__label">Signature fragrances</p>
        </div>
        <div className="stat">
          <p className="stat__value">
            <span>₹</span>950
          </p>
          <p className="stat__label">Starting price per kg</p>
        </div>
        <div className="stat">
          <p className="stat__value">5</p>
          <p className="stat__label">Fragrance families</p>
        </div>
      </div>
    </div>
  </section>
);

export default About;
