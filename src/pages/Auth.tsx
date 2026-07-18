import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Mode = 'login' | 'register';

const Auth = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('С возвращением!');
      } else {
        await register(name, email, password, role, inviteCode);
        toast.success('Аккаунт создан!');
      }
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden grid-bg px-4">
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-primary/25 blur-[120px] animate-blob" />
      <div className="absolute bottom-0 -right-20 w-[460px] h-[460px] rounded-full bg-accent/20 blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex flex-col items-center justify-center gap-3 mb-8">
          <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-brand flex items-center justify-center glow">
            <Icon name="Puzzle" size={40} className="text-white" />
          </div>
          <div className="text-center">
            <span className="font-display font-extrabold text-4xl tracking-tight leading-none block">
              Pro<span className="text-gradient">Puzzle</span>
            </span>
            <span className="text-sm text-muted-foreground">Собери свой проект</span>
          </div>
        </Link>

        <div className="glass rounded-3xl p-8 glow">
          <div className="flex rounded-xl bg-secondary/60 p-1 mb-7">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login' ? 'bg-gradient-brand text-white' : 'text-muted-foreground'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'register' ? 'bg-gradient-brand text-white' : 'text-muted-foreground'
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <Label htmlFor="name" className="text-sm text-muted-foreground mb-1.5 block">Имя</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Как вас зовут"
                  required
                  className="h-12 rounded-xl bg-secondary/60 border-border"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm text-muted-foreground mb-1.5 block">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-12 rounded-xl bg-secondary/60 border-border"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm text-muted-foreground mb-1.5 block">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                className="h-12 rounded-xl bg-secondary/60 border-border"
              />
            </div>

            {mode === 'register' && (
              <div>
                <Label htmlFor="inviteCode" className="text-sm text-muted-foreground mb-1.5 block">Код-приглашение</Label>
                <Input
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Код, полученный от организатора"
                  required
                  className="h-12 rounded-xl bg-secondary/60 border-border"
                />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">Я — </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      role === 'student' ? 'border-primary bg-primary/10' : 'border-border bg-secondary/40'
                    }`}
                  >
                    <Icon name="GraduationCap" size={22} className={role === 'student' ? 'text-primary' : 'text-muted-foreground'} />
                    <span className="text-sm font-medium">Студент</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      role === 'teacher' ? 'border-primary bg-primary/10' : 'border-border bg-secondary/40'
                    }`}
                  >
                    <Icon name="Presentation" size={22} className={role === 'teacher' ? 'text-primary' : 'text-muted-foreground'} />
                    <span className="text-sm font-medium">Преподаватель</span>
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-brand hover:opacity-90 border-0 font-semibold rounded-xl mt-2"
            >
              {loading ? (
                <Icon name="Loader2" size={18} className="animate-spin" />
              ) : mode === 'login' ? (
                'Войти'
              ) : (
                'Создать аккаунт'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;