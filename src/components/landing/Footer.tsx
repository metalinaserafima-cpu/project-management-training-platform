import Icon from '@/components/ui/icon';

const Footer = () => (
  <footer className="border-t border-border pt-16 pb-8">
    <div className="container">
      <div className="mb-14">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
            <Icon name="Puzzle" size={20} className="text-white" />
          </div>
          <span className="font-display font-extrabold text-xl">
            Pro<span className="text-gradient">Puzzle</span>
          </span>
        </div>
        <p className="text-muted-foreground max-w-xs leading-relaxed">
          Обучающая платформа по управлению проектами с интерактивным интерфейсом и практическими заданиями.
        </p>
      </div>

      <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>© 2026 ProPuzzle. Все права защищены.</span>
        <span>Сделано с ❤️ для менеджеров проектов</span>
      </div>
    </div>
  </footer>
);

export default Footer;
