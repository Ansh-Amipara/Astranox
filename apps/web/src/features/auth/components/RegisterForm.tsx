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
    <div className="relative flex min-h-[100dvh] items-start sm:pt-24 justify-center overflow-hidden bg-background text-foreground">
      {/* Monochrome Glass Card */}
      <div className="relative z-10 w-full max-w-md min-h-[100dvh] sm:min-h-0 rounded-none sm:rounded-2xl border-0 sm:border border-border bg-background p-5 sm:p-8 pt-safe pb-safe shadow-2xl">
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/logo.webp" alt="Astranox" className="w-16 h-16 object-contain mb-3 drop-shadow-md" />
          <h1 className="text-4xl font-black tracking-tight text-foreground">Join Astranox</h1>
          <p className="text-xs uppercase font-bold tracking-widest text-muted mt-2">Register a new trainer account</p>
        </div>

        {success ? (
          <div className="rounded-xl bg-surface p-6 text-center border border-border space-y-2">
            <h3 className="text-lg font-bold text-foreground">Registration Successful!</h3>
            <p className="text-sm text-muted">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
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

