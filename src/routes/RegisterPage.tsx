import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, ShieldCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAuthStore } from '../features/auth/auth.store';
import { useToast } from '../features/toasts/useToast';

const registerSchema = z.object({
  name: z.string().min(2, 'Inserisci nome e cognome'),
  email: z.string().email('Inserisci un indirizzo email valido'),
  phone: z.string().min(6, 'Inserisci un recapito telefonico valido'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const registerAccount = useAuthStore((state) => state.registerAccount);
  const status = useAuthStore((state) => state.status);
  const { showToast } = useToast();
  const [submitError, setSubmitError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('');

    try {
      await registerAccount({ ...values, role: 'user' });
      showToast({
        title: 'Account creato',
        description: 'La tua area personale e pronta per preferiti, ricerche e contatti.',
        tone: 'success',
      });
      navigate('/account');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossibile creare l account.';
      setSubmitError(message);
      showToast({
        title: 'Registrazione non riuscita',
        description: message,
        tone: 'error',
      });
    }
  });

  return (
    <section className="section section--page auth-page">
      <div className="container auth-stage auth-stage--register">
        <div className="auth-stage__copy">
          <span className="auth-stage__eyebrow">Registrazione</span>
          <h1>Crea il tuo account personale</h1>
          <p>
            Con l account personale puoi salvare annunci, accedere ai preferiti e gestire il tuo
            profilo. La pubblicazione resta disponibile per i profili professionali.
          </p>

          <div className="auth-stage__highlights">
            <div className="auth-stage__highlight">
              <CheckCircle2 size={18} />
              <span>Preferiti, area personale e accesso rapido alle pagine che usi di piu.</span>
            </div>
            <div className="auth-stage__highlight">
              <ShieldCheck size={18} />
              <span>Area professionale separata per allevatori, canili e rifugi.</span>
            </div>
          </div>
        </div>

        <form className="panel auth-panel" onSubmit={onSubmit}>
          <div className="auth-panel__header">
            <span className="auth-panel__tag">Utente</span>
            <h2>Crea il tuo profilo</h2>
            <p>Inserisci i dati principali e completa la registrazione.</p>
          </div>

          {submitError ? (
            <div className="auth-feedback auth-feedback--error">{submitError}</div>
          ) : null}

          <label>
            Nome e cognome
            <input {...register('name')} placeholder="Giulia Rossi" />
            {errors.name ? <span className="form-error">{errors.name.message}</span> : null}
          </label>

          <label>
            Email
            <input {...register('email')} placeholder="nome@email.it" />
            {errors.email ? <span className="form-error">{errors.email.message}</span> : null}
          </label>

          <label>
            Telefono
            <input {...register('phone')} placeholder="+39 333 123 4567" />
            {errors.phone ? <span className="form-error">{errors.phone.message}</span> : null}
          </label>

          <label>
            Password
            <input {...register('password')} type="password" placeholder="Minimo 6 caratteri" />
            {errors.password ? <span className="form-error">{errors.password.message}</span> : null}
          </label>

          <div className="auth-feedback auth-feedback--info">
            La pubblicazione annunci e la dashboard professionale sono disponibili solo per i
            profili dedicati.
          </div>

          <button
            className="button button--primary auth-panel__submit"
            type="submit"
            disabled={status === 'loading'}
          >
            <UserPlus size={18} />
            {status === 'loading' ? 'Creazione in corso...' : 'Crea account'}
          </button>

          <div className="auth-panel__footer">
            <span>Hai gia un account?</span>
            <Link className="auth-inline-link" to="/login">
              Accedi
              <ArrowRight size={16} />
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
