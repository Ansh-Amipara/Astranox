import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@astranox/types';
import { apiClient } from '@/lib/axios';
import { useAuthStore } from '@/features/auth/store';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { Field, Input, Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const from = searchParams?.get('from') || '/team';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const response = await apiClient.post('/auth/login', data);
      const { accessToken, user } = response.data.data;
      setAuth(accessToken, user);
      notify.success('Session initialized successfully');
      navigate(from);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      if (parsed.fields) {
        for (const [key, msg] of Object.entries(parsed.fields)) {
          if (key in data) {
            setError(key as keyof LoginInput, { message: msg });
          }
        }
      } else {
        setError('root', { message: parsed.message || 'Invalid credentials' });
        notify.error(parsed.message || 'Invalid credentials');
      }
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background text-foreground p-4">
      {/* Tactile Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-raised border border-border p-2.5 flex items-center justify-center mb-4 shadow-xs">
            <img src="/logo.webp" alt="Astranox" className="w-full h-full object-contain drop-shadow-xs" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Astranox</h1>
          <span className="text-[10px] uppercase font-black tracking-widest text-muted px-2.5 py-0.5 rounded-full bg-surface-raised border border-border mt-2">
            Trainer Portal
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Username" error={errors.username?.message} required>
            <Input
              {...register('username')}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </Field>

          <Field label="Password" error={errors.password?.message} required>
            <Input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>

          {errors.root?.message && (
            <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs font-semibold text-danger">
              {errors.root.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                Initializing...
              </span>
            ) : (
              'Initialize Session'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          New trainer?{' '}
          <Link to="/register" className="text-foreground font-bold hover:underline transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export const LoginForm = Login;
export default Login;

