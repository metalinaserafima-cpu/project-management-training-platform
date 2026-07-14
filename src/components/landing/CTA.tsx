import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const CTA = () => {
  const [email, setEmail] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Введите корректный email');
      return;
    }
    toast.success('Готово! Скоро откроем доступ на этот email 🚀');
    setEmail('');
  };

  return (
    <section className="py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] glass p-10 md:p-16 text-center glow">
          <div className="absolute -top-24 left-1/4 w-80 h-80 rounded-full bg-primary/30 blur-[110px] animate-blob" />
          <div className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-accent/25 blur-[110px] animate-blob" style={{ animationDelay: '5s' }} />

          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-display font-black text-4xl md:text-5xl leading-tight mb-5">
              Начни прокачивать <span className="text-gradient">навыки уже сегодня</span>
            </h2>

            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ваш email"
                className="h-13 rounded-xl bg-secondary/60 border-border text-base"
              />
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl h-13 px-7 shrink-0"
              >
                Получить доступ
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;