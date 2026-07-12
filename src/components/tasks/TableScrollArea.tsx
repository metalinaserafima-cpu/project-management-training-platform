import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';
import Icon from '@/components/ui/icon';

interface Props {
  children: ReactNode;
  className?: string;
}

const TableScrollArea = ({ children, className = '' }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    const handleWheel = (e: WheelEvent) => {
      const canScrollX = el.scrollWidth > el.clientWidth;
      if (!canScrollX) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    el.addEventListener('scroll', update);
    el.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', update);
      el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', update);
    };
  }, [update, children]);

  const scrollBy = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className="hidden sm:flex absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-card border border-border items-center justify-center shadow-lg hover:border-primary/50 hover:text-primary"
        >
          <Icon name="ChevronLeft" size={15} />
        </button>
      )}
      {canRight && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          className="hidden sm:flex absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-card border border-border items-center justify-center shadow-lg hover:border-primary/50 hover:text-primary"
        >
          <Icon name="ChevronRight" size={15} />
        </button>
      )}
      <div ref={ref} className={`overflow-x-auto scrollbar-visible ${className}`}>
        {children}
      </div>
      {canRight && (
        <div className="flex sm:hidden items-center justify-center gap-1.5 mt-1.5">
          <Icon name="ArrowLeftRight" size={11} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Проведите пальцем по таблице, чтобы увидеть больше граф</span>
        </div>
      )}
    </div>
  );
};

export default TableScrollArea;
