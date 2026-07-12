import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { label: 'Главная', href: '#hero' },
  { label: 'Курсы', href: '#courses' },
  { label: 'Прогресс', href: '#progress' },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center font-display font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  <Icon name="ChevronDown" size={14} className="text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <div className="px-2 py-1.5">
                  <div className="text-sm font-medium truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.role === 'teacher' ? 'Преподаватель' : 'Студент'}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/projects')} className="cursor-pointer">
                  <Icon name="FolderKanban" size={15} className="mr-2" />
                  {user.role === 'teacher' ? 'Работы студентов' : 'Мои проекты'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <Icon name="LogOut" size={15} className="mr-2" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/auth')} className="text-muted-foreground hover:text-foreground">
                Войти
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl">
                Начать бесплатно
              </Button>
            </>
          )}
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
            {user ? (
              <>
                <button
                  onClick={() => { setOpen(false); navigate('/projects'); }}
                  className="px-4 py-3 rounded-xl text-left font-medium hover:bg-secondary/60 transition-colors flex items-center gap-2"
                >
                  <Icon name="FolderKanban" size={16} />
                  {user.role === 'teacher' ? 'Работы студентов' : 'Мои проекты'}
                </button>
                <Button
                  variant="ghost"
                  onClick={() => { setOpen(false); logout(); }}
                  className="justify-start text-destructive hover:text-destructive"
                >
                  <Icon name="LogOut" size={16} className="mr-2" /> Выйти
                </Button>
              </>
            ) : (
              <Button
                onClick={() => { setOpen(false); navigate('/auth'); }}
                className="bg-gradient-brand border-0 font-semibold rounded-xl mt-2"
              >
                Войти
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;