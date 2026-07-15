import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { statsApi } from '@/lib/api';

const Hero = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { value: '0', label: 'учеников' },
    { value: '12', label: 'курсов' },
    { value: '0', label: 'завершённых проектов' },
  ]);

  useEffect(() => {
    statsApi
      .get()
      .then((data) => {
        setStats([
          { value: String(data.overview.students_count), label: 'учеников' },
          { value: String(data.overview.courses_count), label: 'курсов' },
          { value: String(data.overview.completed_projects), label: 'завершённых проектов' },
        ]);
      })
      .catch(() => {});
  }, [user]);

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="relative overflow-hidden pt-40 pb-24 grid-bg">
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-primary/30 blur-[120px] animate-blob" />
      <div className="absolute top-40 -right-20 w-[460px] h-[460px] rounded-full bg-accent/25 blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-500/20 blur-[120px] animate-blob" style={{ animationDelay: '8s' }} />

      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center animate-fade-up">
          <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
            Прокачай навык
            <br />
            <span className="text-gradient">управления проектами</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-9 leading-relaxed">
            Проходи практические курсы, зарабатывай XP и бейджи, соревнуйся в рейтинге и веди реальные проекты — всё в одном месте.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              onClick={() => scrollTo('#courses')}
              className="bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl h-13 px-7 text-base glow"
            >
              Начать обучение
              <Icon name="ArrowRight" size={18} className="ml-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo('#progress')}
              className="rounded-xl h-13 px-7 text-base border-border bg-secondary/40 hover:bg-secondary"
            >
              <Icon name="Play" size={18} className="mr-1" />
              Как это работает
            </Button>
          </div>

          <div className="flex justify-center gap-10">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display font-extrabold text-3xl text-gradient">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;