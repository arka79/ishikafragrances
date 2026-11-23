import { FaWhatsapp } from 'react-icons/fa';
import { FiInstagram, FiFacebook } from 'react-icons/fi';
import logo from '../images/logo.png';

const WHATSAPP = 'https://wa.me/917872308154';
const EMAIL = 'ishikafragrances@gmail.com';

const FAMILIES = ['Floral', 'Woody', 'Amber', 'Devotional', 'Fruity'];

const Footer = () => (
  <footer className="site-footer">
    <div className="shell">
      <div className="footer__grid">
        <div>
          <div className="footer__brand">
            <span className="brand__mark" aria-hidden="true">
              <img src={logo} alt="" />
            </span>
            <span className="footer__name">Ishika Fragrances</span>
          </div>
          <p className="footer__tagline">
            Handcrafted agarbatti fragrance compounds, made and priced at our own unit in
            East Medinipur, West Bengal.
          </p>
          <div className="footer__socials">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="social"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={16} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social"
              aria-label="Instagram"
            >
              <FiInstagram size={16} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social"
              aria-label="Facebook"
            >
              <FiFacebook size={16} />
            </a>
          </div>
        </div>

        <div>
          <h2 className="footer__heading">Explore</h2>
          <nav className="footer__links" aria-label="Footer">
            <a href="#about">About the house</a>
            <a href="#products">Fragrance &amp; price list</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>

        <div>
          <h2 className="footer__heading">Families</h2>
          <nav className="footer__links" aria-label="Fragrance families">
            {FAMILIES.map((family) => (
              <a key={family} href="#products">
                {family}
              </a>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="footer__heading">Contact</h2>
          <div className="footer__contact">
            <a href="tel:7872308154">7872308154</a>
            <a href="tel:8768919981">8768919981</a>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <span>
              East Medinipur, West Bengal
              <br />
              721633
            </span>
          </div>
        </div>
      </div>

      <p className="footer__wordmark" aria-hidden="true">
        Ishika Fragrances
      </p>

      <div className="footer__bar">
        <span>© {new Date().getFullYear()} Ishika Fragrances</span>
        <span>Manufacturer of agarbatti fragrances · West Bengal</span>
      </div>
    </div>
  </footer>
);

export default Footer;
