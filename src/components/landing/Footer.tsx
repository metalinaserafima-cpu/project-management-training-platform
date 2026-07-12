import Icon from '@/components/ui/icon';

const columns = [
  { title: 'Платформа', links: ['Курсы', 'Проекты', 'Рейтинг', 'Достижения'] },
  { title: 'Компания', links: ['О нас', 'Блог', 'Карьера', 'Контакты'] },
  { title: 'Поддержка', links: ['Помощь', 'Сообщество', 'Правила', 'Приватность'] },
];

const Footer = () => (
  <footer className="border-t border-border pt-16 pb-8">
    <div className="container">
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Icon name="Zap" size={20} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-xl">
              Pro<span className="text-gradient">Level</span>
            </span>
          </div>
          <p className="text-muted-foreground max-w-xs leading-relaxed mb-5">
            Обучающая платформа для менеджеров проектов с игровой механикой и практикой.
          </p>
          <div className="flex gap-3">
            {['Send', 'Youtube', 'Github', 'Twitter'].map((s) => (
              <button
                key={s}
                className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center hover:bg-gradient-brand hover:text-white transition-all"
              >
                <Icon name={s} size={18} />
              </button>
            ))}
          </div>
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
        <span>© 2026 ProLevel. Все права защищены.</span>
        <span>Сделано с ❤️ для менеджеров проектов</span>
      </div>
    </div>
  </footer>
);

export default Footer;
