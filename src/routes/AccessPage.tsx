import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LogIn, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAuthStore } from '../features/auth/auth.store';
import { useToast } from '../features/toasts/useToast';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type Values = z.infer<typeof schema>;

export function AccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginWithPassword = useAuthStore((state) => state.loginWithPassword);
  const status = useAuthStore((state) => state.status);
  const { showToast } = useToast();
  const [submitError, setSubmitError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const state = location.state as { from?: string; message?: string } | null;

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitError('');
      await loginWithPassword(values);
      showToast({
        title: 'Accesso completato',
        description: 'La sessione e stata ripristinata correttamente.',
        tone: 'success',
      });
      const session = useAuthStore.getState().session;
      navigate(
        session?.user.role === 'breeder' || session?.user.role === 'shelter'
          ? '/subscriber'
          : (state?.from ?? '/account')
      );
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Login non riuscito');
    }
  });

  return (
    <section className="section section--page auth-page">
      <div className="container auth-stage">
        <div className="auth-stage__copy">
          <span className="auth-stage__eyebrow">Accesso</span>
          <h1>Accedi al tuo account AdFido</h1>
          <p>Utenti, allevatori privati e canili/rifugi accedono da un unico punto di ingresso.</p>
          <div className="auth-stage__highlights">
            <div className="auth-stage__highlight">
              <UserCircle2 size={18} />
              <span>Area personale per utenti finali.</span>
            </div>
            <div className="auth-stage__highlight">
              <ShieldCheck size={18} />
              <span>Area professionale distinta tra allevatori privati e canili/rifugi.</span>
            </div>
          </div>
        </div>

        <form className="panel auth-panel auth-panel--compact" onSubmit={onSubmit}>
          {state?.message ? (
            <div className="auth-feedback auth-feedback--info">{state.message}</div>
          ) : null}
          {submitError ? (
            <div className="auth-feedback auth-feedback--error">{submitError}</div>
          ) : null}
          <label>
            Email
            <input {...register('email')} />
            {errors.email ? <span className="form-error">Email non valida.</span> : null}
          </label>
          <label>
            Password
            <input {...register('password')} type="password" />
            {errors.password ? <span className="form-error">Password non valida.</span> : null}
          </label>
          <button
            className="button button--primary auth-panel__submit"
            type="submit"
            disabled={status === 'loading'}
          >
            <LogIn size={18} />
            {status === 'loading' ? 'Accesso in corso...' : 'Accedi'}
          </button>
          <div className="auth-panel__footer">
            <span>Non hai ancora un account?</span>
            <Link className="auth-inline-link" to="/register">
              Crea un account
              <ArrowRight size={16} />
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
