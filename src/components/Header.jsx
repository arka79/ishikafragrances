import { useState, useEffect } from 'react';
import { Menu, X, Phone, Sun, Moon, ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import logo from '../images/logo.png';

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'products', label: 'Price list' },
  { id: 'contact', label: 'Contact' },
];

const WHATSAPP = 'https://wa.me/917872308154';

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      return localStorage.getItem('theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      /* storage can be unavailable in private mode */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0d0b0a' : '#f7f2e9');
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="shell header__inner">
          <a href="#top" className="brand" aria-label="Ishika Fragrances — home">
            <span className="brand__mark" aria-hidden="true">
              <img src={logo} alt="" />
            </span>
            <span className="brand__text">
              <span className="brand__name">Ishika Fragrances</span>
              <span className="brand__sub">Agarbatti fragrance house</span>
            </span>
          </a>

          <nav className="nav" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a key={link.id} href={`#${link.id}`} className="nav__link">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="header__actions">
            <a
              className="header__whatsapp"
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
            >
              <FaWhatsapp size={16} />
              <span>WhatsApp</span>
            </a>
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? (
                <Sun size={16} strokeWidth={1.75} />
              ) : (
                <Moon size={16} strokeWidth={1.75} />
              )}
            </button>
            <a href="#products" className="btn btn--solid btn--sm header__cta">
              Price list
              <ArrowRight size={14} strokeWidth={2} />
            </a>
            <button
              type="button"
              className="menu-btn"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <Menu size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="drawer" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer__top">
            <div className="drawer__brand">
              <span className="brand__mark" aria-hidden="true">
                <img src={logo} alt="" />
              </span>
              <span className="brand__name">Ishika Fragrances</span>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>

          <nav className="drawer__nav" aria-label="Mobile">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="drawer__link"
                onClick={() => setOpen(false)}
              >
                {link.label}
                <span>0{i + 1}</span>
              </a>
            ))}
          </nav>

          <div className="drawer__foot">
            <a href="tel:7872308154" className="btn btn--solid btn--block">
              Call 7872308154
              <Phone size={15} strokeWidth={2} />
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost btn--block"
            >
              WhatsApp
              <FaWhatsapp size={16} />
            </a>
            <button type="button" onClick={toggleTheme} className="btn btn--ghost btn--block">
              {theme === 'dark' ? (
                <Sun size={15} strokeWidth={1.75} />
              ) : (
                <Moon size={15} strokeWidth={1.75} />
              )}
              {theme === 'dark' ? 'Light theme' : 'Dark theme'}
            </button>
            <div className="drawer__meta">
              <span>East Medinipur</span>
              <span>West Bengal · 721633</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
