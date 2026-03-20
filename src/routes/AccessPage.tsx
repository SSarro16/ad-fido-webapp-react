import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LogIn, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAuthStore } from '../features/auth/auth.store';
import { useToast } from '../features/toasts/useToast';
import { env } from '../services/env';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type Values = z.infer<typeof schema>;

const demos = [
  {
    title: 'Utente normale',
    description: 'Può salvare gli annunci che gli interessano e gestire i preferiti.',
    email: 'user@adfido.it',
    password: 'AdFidoUser2026!',
  },
  {
    title: 'Allevatore privato',
    description: 'Può creare e modificare annunci, con massimo 3 annunci per account.',
    email: 'breeder.demo@adfido.it',
    password: 'AdFidoBreeder2026!',
  },
  {
    title: 'Canile / Rifugio',
    description:
      'Profilo dedicato ai canili, con possibilità di pubblicare tutti gli annunci necessari.',
    email: 'shelter.demo@adfido.it',
    password: 'AdFidoShelter2026!',
  },
  {
    title: 'CEO / Admin',
    description: 'Area gestionale completa con analytics, moderazione e approvazione annunci.',
    email: 'adfidoadministration@adfido.it',
    password: 'AdFidoAdmin2026!',
  },
] as const;

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
    setValue,
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
        session?.user.role === 'admin'
          ? '/admin'
          : session?.user.role === 'breeder' || session?.user.role === 'shelter'
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
          <p>
            Utenti, allevatori privati, canili/rifugi e CEO/Admin hanno accessi demo rapidi
            separati.
          </p>
          <div className="auth-stage__highlights">
            <div className="auth-stage__highlight">
              <UserCircle2 size={18} />
              <span>Area personale per utenti finali.</span>
            </div>
            <div className="auth-stage__highlight">
              <ShieldCheck size={18} />
              <span>Area amministrativa separata dai profili professionali.</span>
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

        {env.enableDemoAuth ? (
          <div className="panel auth-guidance auth-guidance--demo">
            <div className="auth-guidance__header">
              <strong>Accessi demo rapidi</strong>
              <p>
                Seleziona uno dei 4 profili per compilare automaticamente le credenziali corrette.
              </p>
            </div>
            <div className="auth-card-grid auth-card-grid--demo">
              {demos.map(({ title, description, email, password }) => (
                <button
                  key={email}
                  type="button"
                  className="panel auth-demo-card"
                  onClick={() => {
                    setValue('email', email);
                    setValue('password', password);
                  }}
                >
                  <strong>{title}</strong>
                  <span>{description}</span>
                  <p>{email}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
