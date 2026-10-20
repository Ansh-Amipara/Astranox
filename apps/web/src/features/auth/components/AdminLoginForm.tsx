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
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-xs">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-raised border border-border p-2.5 flex items-center justify-center mb-4 shadow-xs">
            <img src="/logo.webp" alt="Astranox" className="w-full h-full object-contain drop-shadow-xs" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">Admin Portal</h1>
          <span className="text-[10px] uppercase font-black tracking-widest text-muted px-2.5 py-0.5 rounded-full bg-surface-raised border border-border">
            Restricted Terminal Access
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
