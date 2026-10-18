import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminLoginSchema, type AdminLoginInput } from '@astranox/types';
import { useAuthStore } from '@/features/auth/store';
import { apiClient } from '@/lib/axios';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { Field, Input, Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: AdminLoginInput) => {
    try {
      const response = await apiClient.post('/auth/login', data);
      const { accessToken, user } = response.data.data;

      if (user.role !== 'ADMIN') {
        throw new Error('This account does not have admin privileges.');
      }

      setAuth(accessToken, user);
      notify.success('Admin session initialized');
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      if (parsed.fields) {
        for (const [key, msg] of Object.entries(parsed.fields)) {
          if (key in data) {
            setError(key as keyof AdminLoginInput, { message: msg });
          }
        }
      } else {
        const errorMsg = parsed.message || (err as Error)?.message || 'Login failed';
        setError('root', { message: errorMsg });
        notify.error(errorMsg);
      }
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex items-start sm:pt-24 justify-center sm:p-4">
      <div className="max-w-md w-full min-h-[100dvh] sm:min-h-0 bg-surface border-0 sm:border border-border p-5 sm:p-8 pt-safe pb-safe rounded-none sm:rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-xs uppercase font-bold tracking-widest text-muted">Restricted Terminal Access</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field label="Username" error={errors.username?.message} required>
            <Input
              {...register('username')}
              placeholder="admin"
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
            <div className="rounded-xl bg-surface-raised border border-border p-4 text-foreground text-sm font-bold">
              {errors.root.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                Authenticating...
              </span>
            ) : (
              'Access Terminal'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export const AdminLoginForm = AdminLogin;
