import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Главная', href: '#hero' },
  { label: 'Проекты', href: '#projects' },
  { label: 'Курсы', href: '#courses' },
  { label: 'Прогресс', href: '#progress' },
  { label: 'Профиль', href: '#profile' },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass py-3' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container flex items-center justify-between">
        <button onClick={() => scrollTo('#hero')} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center glow">
            <Icon name="Zap" size={20} className="text-white" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight">
            Pro<span className="text-gradient">Level</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Войти
          </Button>
          <Button className="bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl">
            Начать бесплатно
          </Button>
        </div>

        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-secondary/60"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'X' : 'Menu'} size={22} />
        </button>
      </div>

      {open && (
        <div className="md:hidden container mt-3 animate-fade-up">
          <div className="glass rounded-2xl p-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="px-4 py-3 rounded-xl text-left font-medium hover:bg-secondary/60 transition-colors"
              >
                {l.label}
              </button>
            ))}
            <Button className="bg-gradient-brand border-0 font-semibold rounded-xl mt-2">
              Начать бесплатно
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
