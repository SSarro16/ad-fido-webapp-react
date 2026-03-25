import { zodResolver } from '@hookform/resolvers/zod';
import { LayoutDashboard, Save, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { useAuthStore } from '../features/auth/auth.store';
import { useToast } from '../features/toasts/useToast';
import { SectionTitle } from '../ui/SectionTitle';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  organizationName: z.string(),
});

type Values = z.infer<typeof schema>;

type ProfileFeature = {
  title: string;
  body: string;
};

type QuickAction = {
  label: string;
  href: string;
  tone: 'secondary' | 'ghost';
};

export function ProfilePage() {
  const session = useAuthStore((state) => state.session);
  const saveProfile = useAuthStore((state) => state.saveProfile);
  const status = useAuthStore((state) => state.status);
  const { showToast } = useToast();
  const [feedback, setFeedback] = useState<{ tone: 'info' | 'error'; message: string } | null>(
    null
  );
  const dashboardHref =
    session?.user.role === 'breeder' || session?.user.role === 'shelter' ? '/subscriber' : null;
  const accountLabel =
    session?.user.role === 'shelter' || session?.user.accountType === 'shelter_refuge'
      ? 'Canile / Rifugio'
      : session?.user.role === 'breeder' || session?.user.accountType === 'private_breeder'
        ? 'Allevatore privato'
        : session?.user.role === 'admin'
          ? 'Team AdFido'
          : 'Utente';
  const profileTitle =
    session?.user.role === 'shelter' || session?.user.accountType === 'shelter_refuge'
      ? 'Profilo canile / rifugio'
      : session?.user.role === 'breeder' || session?.user.accountType === 'private_breeder'
        ? 'Profilo allevatore privato'
        : session?.user.role === 'admin'
          ? 'Profilo operativo AdFido'
          : 'Profilo utente';
  const roleFeatures = useMemo<ProfileFeature[]>(() => {
    if (session?.user.role === 'admin') {
      return [
        {
          title: 'Profilo operativo',
          body: 'Usa questo spazio per verificare dati account, contatti e accessi della sessione.',
        },
        {
          title: 'Ambiente demo',
          body: 'La repo ufficiale V1 resta focalizzata sui flussi pubblici e professionali del prodotto.',
        },
        {
          title: 'Ruolo separato',
          body: 'Le estensioni di governance e moderazione restano disponibili come evoluzione successiva.',
        },
      ];
    }

    if (session?.user.role === 'shelter' || session?.user.accountType === 'shelter_refuge') {
      return [
        {
          title: 'Identita struttura',
          body: 'Rafforza fiducia e continuita con nome pubblico, telefono e presenza coerente.',
        },
        {
          title: 'Schede affido',
          body: 'Gestisci casi multipli con workflow per stati e passaggio chiaro verso l amministrazione.',
        },
        {
          title: 'Operativita rifugio',
          body: 'Usa il profilo come base ordinata, lasciando alla dashboard il lavoro sui casi attivi.',
        },
      ];
    }

    if (session?.user.role === 'breeder' || session?.user.accountType === 'private_breeder') {
      return [
        {
          title: 'Profilo allevatore',
          body: 'Rendi piu credibile la presenza privata con contatti puliti e nome pubblico leggibile.',
        },
        {
          title: 'Gestione slot',
          body: 'Mantieni il focus su poche schede curate, con massimo 3 annunci per account.',
        },
        {
          title: 'Qualita prima di tutto',
          body: 'Usa il profilo per consolidare identita e la dashboard per rifinire media e contenuti.',
        },
      ];
    }

    return [
      {
        title: 'Profilo utente',
        body: 'Qui tieni ordinati dati personali, contatti e accesso alle tue azioni principali.',
      },
      {
        title: 'Ricerca e preferiti',
        body: 'Il profilo utente resta leggero e orientato a seguire gli annunci salvati.',
      },
      {
        title: 'Esperienza pulita',
        body: 'Niente complessita operative: solo i dati essenziali per usare bene il marketplace.',
      },
    ];
  }, [session]);
  const quickActions = useMemo<QuickAction[]>(
    () =>
      [
        session?.user.role === 'admin'
          ? {
              label: 'Apri feedback sito',
              href: '/admin/feedback',
              tone: 'secondary' as const,
            }
          : null,
        dashboardHref
          ? {
              label: 'Apri dashboard operativa',
              href: dashboardHref,
              tone: 'secondary' as const,
            }
          : null,
        {
          label: session?.user.role === 'user' ? 'Vai ai preferiti' : 'Rivedi il profilo pubblico',
          href: session?.user.role === 'user' ? '/favorites' : '/account',
          tone: 'ghost' as const,
        },
      ].filter((action): action is QuickAction => action !== null),
    [dashboardHref, session]
  );
  const defaultValues = useMemo<Values>(
    () => ({
      name: session?.user.name ?? '',
      phone: session?.user.phone ?? '',
      organizationName: session?.user.organizationName ?? '',
    }),
    [session]
  );
  const { register, handleSubmit, reset } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <section className="section section--page">
      <div className="container">
        <SectionTitle
          eyebrow="Area personale"
          title={`${profileTitle}: ${session?.user.organizationName ?? session?.user.name ?? ''}`.replace(
            /:\s*$/,
            ''
          )}
          description="Profilo personale, stato account e accessi rapidi alle aree operative del ruolo."
          className="section-title--wide"
        />
        <div className="dashboard-grid dashboard-grid--balanced">
          <article className="panel dashboard-bridge profile-hero">
            <div className="dashboard-bridge__header">
              <div>
                <span className="dashboard-bridge__eyebrow">Hub account</span>
                <h3>{profileTitle}</h3>
              </div>
              <UserCircle2 size={20} />
            </div>
            <p>
              Qui gestisci dati account e profilo pubblico. La dashboard resta lo spazio operativo
              dedicato ad annunci e gestione dei flussi principali del marketplace.
            </p>
            <div className="chip-row">
              <span className="chip">{accountLabel}</span>
              {session?.user.emailVerified ? <span className="chip">Email verificata</span> : null}
            </div>
            <div className="profile-quick-actions">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  className={`button dashboard-bridge__cta ${action.tone === 'secondary' ? 'button--secondary' : 'button--ghost'}`}
                  to={action.href}
                >
                  <LayoutDashboard size={18} />
                  {action.label}
                </Link>
              ))}
            </div>
          </article>

          <article className="panel dashboard-bridge dashboard-bridge--soft profile-overview">
            <div className="dashboard-bridge__header">
              <div>
                <span className="dashboard-bridge__eyebrow">Stato accesso</span>
                <h3>Panoramica account</h3>
              </div>
              <ShieldCheck size={20} />
            </div>
            <div className="dashboard-bridge__list">
              <div>
                <strong>Ruolo</strong>
                <span>{accountLabel}</span>
              </div>
              <div>
                <strong>Email</strong>
                <span>{session?.user.email}</span>
              </div>
              <div>
                <strong>Telefono</strong>
                <span>{session?.user.phone ?? 'Non impostato'}</span>
              </div>
            </div>
          </article>
        </div>

        <div className="account-grid profile-feature-grid">
          {roleFeatures.map((feature) => (
            <article key={feature.title} className="panel account-card profile-feature-card">
              <div>
                <strong>{feature.title}</strong>
                <p>{feature.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="dashboard-grid">
          <article className="panel profile-summary-panel">
            <div className="dashboard-panel__header dashboard-panel__header--stacked">
              <div>
                <h3>Stato account</h3>
                <p>
                  Una sintesi piu leggibile del tuo profilo attuale e dei riferimenti principali.
                </p>
              </div>
            </div>
            <div className="chip-row">
              <span className="chip">{accountLabel}</span>
              {session?.user.accountType ? (
                <span className="chip">{session.user.accountType}</span>
              ) : null}
              <span className="chip">{session?.user.email}</span>
            </div>
            <div className="dashboard-bridge__list">
              <div>
                <strong>Email account</strong>
                <span>{session?.user.email}</span>
              </div>
              <div>
                <strong>Telefono attuale</strong>
                <span>{session?.user.phone || 'Non impostato'}</span>
              </div>
              <div>
                <strong>Nome pubblico</strong>
                <span>
                  {session?.user.organizationName || session?.user.name || 'Non impostato'}
                </span>
              </div>
            </div>
          </article>
          <article className="panel profile-form-panel">
            <div className="dashboard-panel__header dashboard-panel__header--stacked">
              <div>
                <h3>Modifica profilo</h3>
                <p>Aggiorna identita, contatti e presenza pubblica del tuo account.</p>
              </div>
            </div>
            <form
              className="editor-form"
              onSubmit={handleSubmit(async (values) => {
                try {
                  setFeedback(null);
                  await saveProfile(values);
                  const message = 'Profilo aggiornato correttamente.';
                  setFeedback({ tone: 'info', message });
                  showToast({
                    title: 'Profilo aggiornato',
                    description: 'I dati account sono stati salvati correttamente.',
                    tone: 'success',
                  });
                } catch (error) {
                  const message =
                    error instanceof Error
                      ? error.message
                      : 'Non siamo riusciti a salvare il profilo.';
                  setFeedback({ tone: 'error', message });
                  showToast({
                    title: 'Salvataggio non riuscito',
                    description: message,
                    tone: 'error',
                  });
                }
              })}
            >
              {feedback ? (
                <div className={`auth-feedback auth-feedback--${feedback.tone}`}>
                  {feedback.message}
                </div>
              ) : null}
              <label>
                Nome
                <input {...register('name')} />
              </label>
              <label>
                Telefono
                <input {...register('phone')} />
              </label>
              <label>
                Nome pubblico
                <input {...register('organizationName')} />
              </label>
              <button
                className="button button--primary"
                type="submit"
                disabled={status === 'loading'}
              >
                <Save size={18} />
                {status === 'loading' ? 'Salvataggio...' : 'Salva profilo'}
              </button>
            </form>
          </article>
        </div>
      </div>
    </section>
  );
}
