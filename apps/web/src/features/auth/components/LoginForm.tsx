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
    <div className="relative flex min-h-screen items-start sm:pt-24 justify-center overflow-hidden bg-background text-foreground">
      {/* Monochrome Glass Card */}
      <div className="relative z-10 w-full max-w-md min-h-screen sm:min-h-0 rounded-none sm:rounded-2xl border-0 sm:border border-border bg-background p-8 shadow-2xl">
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/logo.webp" alt="Astranox" className="w-16 h-16 object-contain mb-3 drop-shadow-md" />
          <h1 className="text-4xl font-black tracking-tight text-foreground">Astranox</h1>
          <p className="text-xs uppercase font-bold tracking-widest text-muted mt-2">Trainer Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Field label="Username" error={errors.username?.message} required>
            <Input
              {...register('username')}
              placeholder="username"
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
            <div className="rounded-xl bg-surface p-3 text-sm text-foreground border border-border">
              {errors.root.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
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

        <p className="mt-6 text-center text-sm text-muted">
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

