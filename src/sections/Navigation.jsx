import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Stethoscope } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef(null);

  const navLinks = [
    { name: 'Beranda', href: '#hero' },
    { name: 'Fitur', href: '#features' },
    { name: 'Cara Kerja', href: '#how-it-works' },
    { name: 'Penyakit', href: '#diseases' },
    { name: 'Demo', href: '#demo' },
    { name: 'Obat', href: '#medicine' },
  ];

  useEffect(() => {
    // Pakai langsung DOM manipulation untuk menghindari React re-render lag
    const nav = navRef.current;
    if (!nav) return;

    const onScroll = () => {
      const scrolled = window.scrollY > 80;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    // Throttle dengan requestAnimationFrame agar tidak patah-patah
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3'
            : 'bg-transparent py-5'
        }`}
        style={{ transition: 'background-color 0.2s ease, box-shadow 0.2s ease, padding 0.2s ease' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#hero"
              onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800">
                CatSkin<span className="text-blue-600">AI</span>
              </span>
            </a>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-slate-100/80 backdrop-blur-sm rounded-full px-1.5 py-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                  className="px-2.5 xl:px-3.5 py-1.5 text-xs xl:text-sm font-medium text-slate-600 hover:text-blue-600 rounded-full hover:bg-white hover:shadow-xs transition-colors duration-150"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
              <Button
                onClick={() => scrollToSection('#demo')}
                className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-full px-3.5 xl:px-5 py-1.5 xl:py-2 text-xs xl:text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                Mulai Diagnosa
              </Button>
            </div>

            {/* Mobile / Tablet toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-150"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                  className="px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-colors duration-150"
                >
                  {link.name}
                </a>
              ))}
              <Button
                onClick={() => scrollToSection('#demo')}
                className="mt-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl py-6"
              >
                Mulai Diagnosa
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
