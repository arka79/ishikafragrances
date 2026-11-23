import { useEffect } from 'react';
import { CatalogueProvider } from './data/CatalogueContext.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Products from './components/Products.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

const App = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const targets = document.querySelectorAll('.fade-in');
    targets.forEach((el) => observer.observe(el));

    // Reveal the opening section immediately.
    document
      .querySelectorAll('#top .fade-in')
      .forEach((el) => el.classList.add('visible'));

    return () => observer.disconnect();
  }, []);

  return (
    <CatalogueProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Products />
        <Contact />
      </main>
      <Footer />
    </CatalogueProvider>
  );
};

export default App;
