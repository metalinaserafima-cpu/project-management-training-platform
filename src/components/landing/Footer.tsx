import Icon from '@/components/ui/icon';

const columns = [
  { title: 'Платформа', links: ['Курсы', 'Проекты', 'Рейтинг', 'Достижения'] },
  { title: 'Поддержка', links: ['Помощь', 'Сообщество', 'Правила', 'Приватность'] },
];

const Footer = () => (
  <footer className="border-t border-border pt-16 pb-8">
    <div className="container">
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Icon name="Puzzle" size={20} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-xl">
              Pro<span className="text-gradient">Puzzle</span>
            </span>
          </div>
          <p className="text-muted-foreground max-w-xs leading-relaxed mb-5">
            Обучающая платформа по управлению проектами с интерактивным интерфейсом и практическими заданиями.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-display font-bold mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>© 2026 ProPuzzle. Все права защищены.</span>
        <span>Сделано с ❤️ для менеджеров проектов</span>
      </div>
    </div>
  </footer>
);

export default Footer;