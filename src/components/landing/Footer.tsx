import Icon from '@/components/ui/icon';

const Footer = () => (
  <footer className="border-t border-border pt-16 pb-8">
    <div className="container">
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shrink-0">
            <Icon name="Puzzle" size={30} className="text-white" />
          </div>
          <div>
            <span className="font-display font-extrabold text-2xl leading-none block">
              Pro<span className="text-gradient">Puzzle</span>
            </span>
            <span className="text-xs text-muted-foreground">Собери свой проект</span>
          </div>
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