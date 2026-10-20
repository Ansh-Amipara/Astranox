import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@astranox/types';
import { apiClient } from '@/lib/axios';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { Field, Input, Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';

export function Register() {
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await apiClient.post('/auth/register', data);
      setSuccess(true);
      notify.success('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      if (parsed.fields) {
        for (const [key, msg] of Object.entries(parsed.fields)) {
          if (key in data) {
            setError(key as keyof RegisterInput, { message: msg });
          }
        }
      } else {
        setError('root', { message: parsed.message || 'Registration failed' });
        notify.error(parsed.message || 'Registration failed');
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
          <h1 className="text-3xl font-black tracking-tight text-foreground">Join Astranox</h1>
          <span className="text-[10px] uppercase font-black tracking-widest text-muted px-2.5 py-0.5 rounded-full bg-surface-raised border border-border mt-2">
            New Trainer Registration
          </span>
        </div>

        {success ? (
          <div className="rounded-2xl bg-surface-raised p-6 text-center border border-border space-y-2">
            <span className="inline-block text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 mb-2">
              Registration Complete
            </span>
            <h3 className="text-lg font-black text-foreground">Welcome to Astranox!</h3>
            <p className="text-xs text-muted">Redirecting you to the trainer portal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Username" error={errors.username?.message} required>
              <Input
                {...register('username')}
                placeholder="AshKetchum"
                autoComplete="username"
              />
            </Field>

            <Field label="Email" error={errors.email?.message} required>
              <Input
                type="email"
                {...register('email')}
                placeholder="ash@pallet.town"
                autoComplete="email"
              />
            </Field>

            <Field label="Password" error={errors.password?.message} required>
              <Input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                autoComplete="new-password"
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted">
          Already a trainer?{' '}
          <Link to="/login" className="text-foreground font-bold hover:underline transition-colors">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export const RegisterForm = Register;
export default Register;

