import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Camera,
  CircleGauge,
  HeartHandshake,
  Images,
  PencilLine,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  Warehouse,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { useAuthStore } from '../features/auth/auth.store';
import {
  useCreateManagedListing,
  useDeleteManagedListing,
  useManagedListings,
  useUpdateManagedListing,
  useUpdateManagedListingStatus,
} from '../features/subscriber/subscriber.queries';
import { uploadListingImages } from '../features/uploads/upload.service';
import { useToast } from '../features/toasts/useToast';
import type {
  ListingWorkflowStatus,
  ManagedListing,
  ManagedListingInput,
} from '../types/subscriber';
import { DogLoadingScreen } from '../ui/DogLoadingScreen';
import { LocationAutocompleteInput } from '../ui/LocationAutocompleteInput';
import { SectionTitle } from '../ui/SectionTitle';

const breederListingLimit = 3;
const maxListingImages = 8;

const schema = z.object({
  title: z.string().min(2),
  breed: z.string().min(2),
  city: z.string().min(2),
  region: z.string().min(2),
  ageLabel: z.string().min(2),
  sex: z.enum(['Maschio', 'Femmina']),
  color: z.string().min(2),
  excerpt: z.string().min(8),
  description: z.string().min(20),
  tagsText: z.string(),
  traitsText: z.string(),
  images: z.array(z.string()).min(1, 'Carica almeno una foto.').max(maxListingImages),
  coverImage: z.string().min(4, 'Seleziona una cover.'),
});

type FormValues = z.infer<typeof schema>;
type SellerMode = 'breeder' | 'shelter';
type ComposerDraftCard = {
  id: string;
};

const emptyValues: FormValues = {
  title: '',
  breed: '',
  city: '',
  region: '',
  ageLabel: '',
  sex: 'Maschio',
  color: '',
  excerpt: '',
  description: '',
  tagsText: '',
  traitsText: '',
  images: [],
  coverImage: '',
};

const statusLabels: Record<ListingWorkflowStatus, string> = {
  draft: 'Bozza',
  in_review: 'In revisione',
  published: 'Pubblicato',
  rejected: 'Respinto',
  removed: 'Rimosso',
};

function createComposerDraft(): ComposerDraftCard {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return { id: crypto.randomUUID() };
  }

  return { id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
}

function commaList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function dedupe(values: string[]) {
  return Array.from(new Set(values));
}

function toValues(listing: ManagedListing): FormValues {
  return {
    title: listing.title,
    breed: listing.breed,
    city: listing.city,
    region: listing.region,
    ageLabel: listing.ageLabel,
    sex: listing.sex,
    color: listing.color,
    excerpt: listing.excerpt,
    description: listing.description,
    tagsText: listing.tags.join(', '),
    traitsText: listing.traits.join(', '),
    images: listing.images,
    coverImage: listing.coverImage,
  };
}

function getSellerMode(role: string | undefined, accountType: string | undefined): SellerMode {
  if (role === 'shelter' || accountType === 'shelter_refuge') {
    return 'shelter';
  }

  return 'breeder';
}

function formatLocationLabel(city: string, region: string) {
  return [city, region].filter(Boolean).join(', ');
}

function parseLocationLabel(value: string) {
  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    city: parts[0] ?? '',
    region: parts[1] ?? '',
  };
}

function toManagedListingInput(
  values: FormValues,
  status: 'draft' | 'in_review'
): ManagedListingInput {
  const images = dedupe(values.images).slice(0, maxListingImages);
  const coverImage = images.includes(values.coverImage) ? values.coverImage : (images[0] ?? '');

  return {
    title: values.title.trim(),
    breed: values.breed.trim(),
    city: values.city.trim(),
    region: values.region.trim(),
    ageLabel: values.ageLabel.trim(),
    sex: values.sex,
    color: values.color.trim(),
    excerpt: values.excerpt.trim(),
    description: values.description.trim(),
    tags: commaList(values.tagsText),
    traits: commaList(values.traitsText),
    images,
    coverImage,
    status,
  };
}

type ListingComposerCardProps = {
  composerId: string;
  title: string;
  subtitle: string;
  token?: string;
  sellerMode: SellerMode;
  isBusy: boolean;
  initialListing?: ManagedListing;
  onClose: () => void;
  onCreate: (
    input: ManagedListingInput,
    composerId: string,
    status: 'draft' | 'in_review'
  ) => Promise<void>;
  onUpdate: (
    listing: ManagedListing,
    input: ManagedListingInput,
    status: 'draft' | 'in_review'
  ) => Promise<void>;
  onDelete: (listing: ManagedListing) => Promise<void>;
  onRestoreDraft: (listing: ManagedListing) => Promise<void>;
};

function ListingComposerCard({
  composerId,
  title,
  subtitle,
  token,
  sellerMode,
  isBusy,
  initialListing,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  onRestoreDraft,
}: ListingComposerCardProps) {
  const { showToast } = useToast();
  const [submitMessage, setSubmitMessage] = useState<{
    tone: 'info' | 'error';
    text: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [locationLabel, setLocationLabel] = useState(
    formatLocationLabel(initialListing?.city ?? '', initialListing?.region ?? '')
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialListing ? toValues(initialListing) : emptyValues,
  });

  const images = watch('images');
  const coverImage = watch('coverImage');

  useEffect(() => {
    const nextValues = initialListing ? toValues(initialListing) : emptyValues;
    reset(nextValues);
    setLocationLabel(formatLocationLabel(nextValues.city, nextValues.region));
    setSubmitMessage(null);
  }, [initialListing, reset]);

  async function handleFileUpload(fileList: FileList | null) {
    if (!token || !fileList?.length) {
      return;
    }

    const existingImages = getValues('images');
    const availableSlots = maxListingImages - existingImages.length;

    if (availableSlots <= 0) {
      showToast({
        title: 'Limite immagini raggiunto',
        description: `Puoi caricare al massimo ${maxListingImages} foto per scheda.`,
        tone: 'warning',
      });
      return;
    }

    const files = Array.from(fileList).slice(0, availableSlots);

    try {
      setIsUploading(true);
      const uploadedFiles = await uploadListingImages(token, files);
      const nextImages = dedupe([
        ...existingImages,
        ...uploadedFiles.map((file) => file.url),
      ]).slice(0, maxListingImages);

      setValue('images', nextImages, { shouldDirty: true, shouldValidate: true });

      if (!getValues('coverImage') || !nextImages.includes(getValues('coverImage'))) {
        setValue('coverImage', nextImages[0] ?? '', { shouldDirty: true, shouldValidate: true });
      }

      showToast({
        title: 'Foto caricate',
        description: `${uploadedFiles.length} ${uploadedFiles.length === 1 ? 'immagine aggiunta' : 'immagini aggiunte'} alla scheda.`,
        tone: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload immagini non riuscito.';
      showToast({
        title: 'Upload non riuscito',
        description: message,
        tone: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemoveImage(imageUrl: string) {
    const nextImages = getValues('images').filter((item) => item !== imageUrl);
    setValue('images', nextImages, { shouldDirty: true, shouldValidate: true });

    if (getValues('coverImage') === imageUrl) {
      setValue('coverImage', nextImages[0] ?? '', { shouldDirty: true, shouldValidate: true });
    }
  }

  const save = (status: 'draft' | 'in_review') =>
    handleSubmit(async (values) => {
      const input = toManagedListingInput(values, status);

      try {
        setSubmitMessage(null);

        if (initialListing) {
          await onUpdate(initialListing, input, status);
          setSubmitMessage({
            tone: 'info',
            text:
              status === 'in_review'
                ? 'Scheda aggiornata e inviata in revisione.'
                : 'Bozza aggiornata correttamente.',
          });
          return;
        }

        await onCreate(input, composerId, status);
        setSubmitMessage({
          tone: 'info',
          text:
            status === 'in_review'
              ? 'Nuova scheda creata e inviata in revisione.'
              : 'Nuova bozza creata correttamente.',
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Non siamo riusciti a salvare la scheda.';
        setSubmitMessage({ tone: 'error', text: message });
      }
    });

  return (
    <article className="panel seller-composer seller-composer-card">
      <div className="seller-composer__header">
        <div>
          <span className="seller-dashboard-sidebar__eyebrow">
            {sellerMode === 'breeder' ? 'Scheda privata' : 'Scheda affido'}
          </span>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="seller-composer__header-actions">
          {initialListing ? (
            <span className="chip">{statusLabels[initialListing.status]}</span>
          ) : (
            <span className="chip">Nuova card</span>
          )}
          <button
            type="button"
            className="button button--ghost seller-composer__close"
            onClick={onClose}
          >
            <X size={16} />
            Chiudi
          </button>
        </div>
      </div>

      {submitMessage ? (
        <div className={`auth-feedback auth-feedback--${submitMessage.tone}`}>
          {submitMessage.text}
        </div>
      ) : null}

      {initialListing?.adminNotes ? (
        <div className="panel dashboard-feedback">Nota admin: {initialListing.adminNotes}</div>
      ) : null}

      <form className="seller-editor">
        <section className="seller-editor__section">
          <div className="seller-editor__section-title">
            <strong>Dati essenziali</strong>
            <p>Parti da titolo, localita e dettagli principali della scheda.</p>
          </div>

          <div className="seller-editor__grid seller-editor__grid--two">
            <label>
              Titolo annuncio
              <input
                {...register('title')}
                placeholder={
                  sellerMode === 'breeder'
                    ? 'Cucciolo Golden Retriever'
                    : 'Luna - affido responsabile'
                }
              />
              {errors.title ? <span className="form-error">{errors.title.message}</span> : null}
            </label>

            <label>
              Razza
              <input {...register('breed')} placeholder="Golden Retriever, Meticcio..." />
              {errors.breed ? <span className="form-error">{errors.breed.message}</span> : null}
            </label>

            <div className="seller-editor__location">
              <Controller
                control={control}
                name="city"
                render={() => (
                  <LocationAutocompleteInput
                    label="Localita"
                    name="city"
                    value={locationLabel}
                    placeholder="Cerca citta, provincia o regione"
                    onChange={(value) => {
                      const parsed = parseLocationLabel(value);
                      setLocationLabel(value);
                      setValue('city', parsed.city || value.trim(), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      if (parsed.region) {
                        setValue('region', parsed.region, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                )}
              />
              {errors.city ? <span className="form-error">{errors.city.message}</span> : null}
            </div>

            <label>
              Regione
              <input {...register('region')} placeholder="Lombardia" />
              <span className="seller-editor__helper">
                Compilata automaticamente quando possibile, ma sempre modificabile.
              </span>
              {errors.region ? <span className="form-error">{errors.region.message}</span> : null}
            </label>

            <label>
              Eta
              <input {...register('ageLabel')} placeholder="6 mesi" />
              {errors.ageLabel ? (
                <span className="form-error">{errors.ageLabel.message}</span>
              ) : null}
            </label>

            <label>
              Sesso
              <select {...register('sex')}>
                <option value="Maschio">Maschio</option>
                <option value="Femmina">Femmina</option>
              </select>
            </label>

            <label>
              Colore
              <input {...register('color')} placeholder="Bianco, fulvo, nero..." />
              {errors.color ? <span className="form-error">{errors.color.message}</span> : null}
            </label>
          </div>
        </section>

        <section className="seller-editor__section">
          <div className="seller-editor__section-title">
            <strong>Testi e contesto</strong>
            <p>Rendi chiaro subito perche questa scheda merita fiducia e attenzione.</p>
          </div>

          <div className="seller-editor__grid">
            <label>
              Estratto breve
              <textarea
                {...register('excerpt')}
                rows={3}
                placeholder="Riassunto breve e leggibile della scheda."
              />
              {errors.excerpt ? <span className="form-error">{errors.excerpt.message}</span> : null}
            </label>

            <label>
              Descrizione completa
              <textarea
                {...register('description')}
                rows={6}
                placeholder="Spiega carattere, contesto, documentazione e stato del cane."
              />
              {errors.description ? (
                <span className="form-error">{errors.description.message}</span>
              ) : null}
            </label>
          </div>
        </section>

        <section className="seller-editor__section">
          <div className="seller-editor__section-title">
            <strong>Tag, tratti e media</strong>
            <p>Carica foto reali, scegli la cover e mantieni la galleria ordinata.</p>
          </div>

          <div className="seller-editor__grid seller-editor__grid--two">
            <label>
              Tag
              <input {...register('tagsText')} placeholder="Vaccini, Microchip, Pedigree" />
            </label>

            <label>
              Tratti
              <input {...register('traitsText')} placeholder="Socievole, Docile, Energico" />
            </label>
          </div>

          <div className="media-uploader">
            <div className="media-uploader__header">
              <div>
                <strong>Foto annuncio</strong>
                <p>
                  Massimo {maxListingImages} immagini. La prima cover valida viene selezionata
                  automaticamente.
                </p>
              </div>
              <label className="button button--ghost media-uploader__button">
                <Upload size={16} />
                {isUploading ? 'Caricamento...' : 'Carica foto'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isBusy || isUploading}
                  onChange={(event) => {
                    void handleFileUpload(event.target.files);
                    event.target.value = '';
                  }}
                />
              </label>
            </div>

            <div className="media-uploader__meta">
              <span className="seller-editor__helper">
                {images.length}/{maxListingImages} immagini caricate
              </span>
              {coverImage ? <span className="chip">Cover selezionata</span> : null}
            </div>

            {images.length === 0 ? (
              <div className="media-uploader__empty">
                <Camera size={18} />
                <span>Carica almeno una foto prima di salvare o inviare la scheda.</span>
              </div>
            ) : (
              <div className="media-gallery">
                {images.map((imageUrl, index) => (
                  <article key={imageUrl} className="media-gallery__item">
                    <img src={imageUrl} alt={`Anteprima foto ${index + 1}`} />
                    <div className="media-gallery__actions">
                      <button
                        type="button"
                        className={
                          coverImage === imageUrl
                            ? 'button button--secondary'
                            : 'button button--ghost'
                        }
                        onClick={() => {
                          setValue('coverImage', imageUrl, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      >
                        {coverImage === imageUrl ? 'Cover attuale' : 'Usa come cover'}
                      </button>
                      <button
                        type="button"
                        className="media-gallery__remove"
                        aria-label="Rimuovi immagine"
                        onClick={() => handleRemoveImage(imageUrl)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {errors.images ? <span className="form-error">{errors.images.message}</span> : null}
            {errors.coverImage ? (
              <span className="form-error">{errors.coverImage.message}</span>
            ) : null}
          </div>
        </section>

        <div className="seller-editor__actions">
          <button
            type="button"
            className="button button--ghost"
            disabled={isBusy || isUploading}
            onClick={save('draft')}
          >
            {isBusy ? 'Operazione in corso...' : 'Salva bozza'}
          </button>
          <button
            type="button"
            className="button button--secondary"
            disabled={isBusy || isUploading}
            onClick={save('in_review')}
          >
            {isBusy ? 'Operazione in corso...' : 'Invia all admin'}
          </button>
          {initialListing && initialListing.status !== 'draft' ? (
            <button
              type="button"
              className="button button--ghost"
              disabled={isBusy || isUploading}
              onClick={() => void onRestoreDraft(initialListing)}
            >
              Riporta a bozza
            </button>
          ) : null}
          {initialListing ? (
            <button
              type="button"
              className="button button--ghost"
              disabled={isBusy || isUploading}
              onClick={() => void onDelete(initialListing)}
            >
              Elimina scheda
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}

export function ProfessionalDashboardPage() {
  const session = useAuthStore((state) => state.session);
  const token = session?.token;
  const { data: listings = [], isLoading: isListingsLoading } = useManagedListings(token);
  const createListing = useCreateManagedListing(token);
  const updateListing = useUpdateManagedListing(token);
  const updateStatus = useUpdateManagedListingStatus(token);
  const deleteListing = useDeleteManagedListing(token);
  const { showToast } = useToast();
  const [draftCards, setDraftCards] = useState<ComposerDraftCard[]>([]);
  const [openListingIds, setOpenListingIds] = useState<string[]>([]);

  const sellerMode = getSellerMode(session?.user.role, session?.user.accountType);
  const isBreeder = sellerMode === 'breeder';
  const isBusy =
    createListing.isPending ||
    updateListing.isPending ||
    updateStatus.isPending ||
    deleteListing.isPending;
  const showDashboardLoader = isListingsLoading || isBusy;
  const breederSlotsUsed = listings.length;
  const breederSlotsLeft = Math.max(0, breederListingLimit - breederSlotsUsed);
  const breederLimitReached = isBreeder && breederSlotsUsed >= breederListingLimit;

  useEffect(() => {
    if (listings.length === 0) {
      setOpenListingIds([]);
      return;
    }

    setOpenListingIds((current) => {
      const next = current.filter((listingId) => listings.some((item) => item.id === listingId));
      return next;
    });
  }, [listings]);

  const openListings = useMemo(
    () =>
      openListingIds
        .map((listingId) => listings.find((item) => item.id === listingId))
        .filter(Boolean) as ManagedListing[],
    [listings, openListingIds]
  );

  const dashboardCopy =
    sellerMode === 'breeder'
      ? {
          eyebrow: 'Allevatore privato',
          titlePrefix: 'Dashboard allevatore privato',
          description:
            'Area operativa pensata per chi gestisce poche schede curate, con massimo 3 annunci per account e workflow chiaro verso l amministrazione.',
          leadTitle: 'Una dashboard piu compatta, focalizzata sui tuoi 3 slot.',
          leadBody:
            'Qui lavori su poche schede, con attenzione a completezza, media e invio in revisione. L obiettivo non e riempire l area, ma tenere tutto leggibile e sotto controllo.',
          workflowTitle: 'Regole per allevatore privato',
          workflowItems: [
            ['Limite account', 'Massimo 3 annunci attivi o in lavorazione per account.'],
            ['Bozze snelle', 'Ogni scheda va preparata bene prima dell invio in revisione.'],
            ['Approccio premium', 'Poche schede, ma piu pulite, piu complete e piu credibili.'],
          ],
          createLabel: 'Nuovo annuncio',
          createDescription:
            'Ogni click apre una nuova card indipendente, senza sovrascrivere le schede gia aperte.',
          listTitle: 'I tuoi 3 slot annunci',
          createCardTitle: 'Nuovo annuncio privato',
          createCardSubtitle:
            'Compila una nuova scheda in una card separata, con localita suggerita e upload foto reale.',
        }
      : {
          eyebrow: 'Canile / Rifugio',
          titlePrefix: 'Dashboard canile / rifugio',
          description:
            'Area operativa dedicata a canili e rifugi, pensata per gestire piu schede affido, lavorare per stati e tenere visibile il contesto della struttura.',
          leadTitle: 'Una dashboard adatta a un flusso piu ampio e continuativo.',
          leadBody:
            'Qui puoi gestire tutte le schede necessarie per il rifugio, organizzare i casi in revisione e mantenere ordinata la presenza pubblica della struttura.',
          workflowTitle: 'Regole per canile / rifugio',
          workflowItems: [
            [
              'Annunci illimitati',
              'Puoi gestire tutte le schede affido necessarie alla struttura.',
            ],
            ['Workflow per stati', 'Bozze, revisioni e feedback admin restano sempre leggibili.'],
            ['Contesto struttura', 'L obiettivo e dare fiducia con schede ordinate e coerenti.'],
          ],
          createLabel: 'Nuova scheda affido',
          createDescription:
            'Ogni click apre una nuova card separata, cosi puoi lavorare su piu casi del rifugio in parallelo.',
          listTitle: 'Schede del canile / rifugio',
          createCardTitle: 'Nuova scheda affido',
          createCardSubtitle:
            'Apri una card dedicata per ogni nuovo caso del rifugio, senza alterare le schede gia aperte.',
        };

  const sellerStats = isBreeder
    ? [
        {
          label: 'Slot usati',
          value: `${breederSlotsUsed}/${breederListingLimit}`,
          note:
            breederSlotsLeft > 0
              ? `${breederSlotsLeft} slot ancora disponibili`
              : 'Hai raggiunto il limite account',
          icon: CircleGauge,
        },
        {
          label: 'In revisione',
          value: String(listings.filter((item) => item.status === 'in_review').length),
          note: 'Schede gia inviate all amministrazione',
          icon: ShieldCheck,
        },
        {
          label: 'Pubblicati',
          value: String(listings.filter((item) => item.status === 'published').length),
          note: 'Schede gia visibili nel marketplace',
          icon: HeartHandshake,
        },
        {
          label: 'Media totali',
          value: String(listings.reduce((sum, item) => sum + item.images.length, 0)),
          note: 'Immagini distribuite sulle tue schede',
          icon: Images,
        },
      ]
    : [
        {
          label: 'Schede gestite',
          value: String(listings.length),
          note: 'Totale schede del canile / rifugio',
          icon: Warehouse,
        },
        {
          label: 'In revisione',
          value: String(listings.filter((item) => item.status === 'in_review').length),
          note: 'Richieste attualmente in attesa admin',
          icon: ShieldCheck,
        },
        {
          label: 'Pubblicate',
          value: String(listings.filter((item) => item.status === 'published').length),
          note: 'Schede gia online nel marketplace',
          icon: HeartHandshake,
        },
        {
          label: 'Bozze aperte',
          value: String(listings.filter((item) => item.status === 'draft').length),
          note: 'Schede ancora da completare',
          icon: Camera,
        },
      ];

  function openListingCard(listingId: string) {
    setDraftCards([]);
    setOpenListingIds([listingId]);
  }

  function closeListingCard(listingId: string) {
    setOpenListingIds((current) => current.filter((item) => item !== listingId));
  }

  function openNewCard() {
    if (breederLimitReached) {
      showToast({
        title: 'Limite raggiunto',
        description: 'L allevatore privato puo gestire al massimo 3 annunci per account.',
        tone: 'warning',
      });
      return;
    }

    setOpenListingIds([]);
    setDraftCards((current) => {
      if (current.length > 0) {
        showToast({
          title: 'Bozza gia aperta',
          description: 'Completa o chiudi la bozza attuale prima di aprirne un altra.',
          tone: 'info',
        });
        return current;
      }

      return [createComposerDraft()];
    });
  }

  async function handleCreate(
    input: ManagedListingInput,
    composerId: string,
    status: 'draft' | 'in_review'
  ) {
    const next = await createListing.mutateAsync(input);
    setDraftCards((current) => current.filter((draft) => draft.id !== composerId));
    setOpenListingIds([next.id]);
    showToast({
      title: status === 'in_review' ? 'Scheda creata e inviata' : 'Bozza creata',
      description:
        status === 'in_review'
          ? 'La nuova scheda e stata creata e inviata all amministrazione.'
          : 'La nuova bozza e pronta per essere completata.',
      tone: 'success',
    });
  }

  async function handleUpdate(
    listing: ManagedListing,
    input: ManagedListingInput,
    status: 'draft' | 'in_review'
  ) {
    await updateListing.mutateAsync({ listingId: listing.id, input });
    showToast({
      title: status === 'in_review' ? 'Scheda inviata in revisione' : 'Bozza aggiornata',
      description:
        status === 'in_review'
          ? 'La scheda e stata aggiornata e inviata all amministrazione.'
          : 'Le modifiche sono state salvate correttamente.',
      tone: 'success',
    });
  }

  async function handleDelete(listing: ManagedListing) {
    if (!window.confirm(`Vuoi eliminare definitivamente "${listing.title}"?`)) {
      return;
    }

    await deleteListing.mutateAsync(listing.id);
    setOpenListingIds((current) => current.filter((item) => item !== listing.id));
    showToast({
      title: 'Scheda eliminata',
      description: 'La scheda e stata rimossa correttamente.',
      tone: 'success',
    });
  }

  async function handleRestoreDraft(listing: ManagedListing) {
    await updateStatus.mutateAsync({ listingId: listing.id, status: 'draft' });
    showToast({
      title: 'Scheda riportata in bozza',
      description: 'Ora puoi modificarla di nuovo prima di reinviarla.',
      tone: 'success',
    });
  }

  return (
    <section className="section section--page">
      <div className="container">
        {showDashboardLoader ? (
          <div className="seller-dashboard-loader">
            <DogLoadingScreen
              title={
                isListingsLoading
                  ? 'Stiamo radunando le tue schede'
                  : 'Stiamo aggiornando il tuo spazio operativo'
              }
              description={
                isListingsLoading
                  ? 'Recuperiamo annunci, stato revisione e materiali del tuo profilo.'
                  : 'Salvataggi, revisioni e modifiche stanno arrivando a destinazione.'
              }
              variant="page"
            />
          </div>
        ) : null}

        <SectionTitle
          eyebrow={dashboardCopy.eyebrow}
          title={`${dashboardCopy.titlePrefix}: ${session?.user.organizationName ?? session?.user.name ?? ''}`.replace(
            /:\s*$/,
            ''
          )}
          description={dashboardCopy.description}
          className="section-title--wide"
        />

        <div className={`seller-headline seller-headline--${sellerMode}`}>
          <article className="panel seller-headline__hero">
            <div className="seller-headline__copy">
              <span className="seller-headline__eyebrow">{dashboardCopy.eyebrow}</span>
              <h2>{dashboardCopy.leadTitle}</h2>
              <p>{dashboardCopy.leadBody}</p>
            </div>

            <div className="seller-headline__meta">
              <div className="seller-headline__meta-card">
                <strong>
                  {isBreeder ? `${breederSlotsUsed}/${breederListingLimit}` : listings.length}
                </strong>
                <span>{isBreeder ? 'slot usati' : 'schede totali'}</span>
              </div>
              <div className="seller-headline__meta-card">
                <strong>{listings.filter((item) => item.status === 'in_review').length}</strong>
                <span>in revisione</span>
              </div>
            </div>
          </article>

          <article className="panel seller-workflow">
            <div className="seller-workflow__header">
              <span className="seller-headline__eyebrow">Workflow</span>
              <h3>{dashboardCopy.workflowTitle}</h3>
            </div>
            <div className="seller-workflow__list">
              {dashboardCopy.workflowItems.map(([title, body]) => (
                <div key={title}>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              ))}
            </div>
            <Link className="button button--ghost" to="/account">
              Vai all&apos;area personale
              <ArrowRight size={18} />
            </Link>
          </article>
        </div>

        <div className="account-grid seller-stats">
          {sellerStats.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.label} className="panel account-card seller-stat-card">
                <Icon size={22} />
                <div>
                  <strong>{item.value}</strong>
                  <p>{item.label}</p>
                  <small>{item.note}</small>
                </div>
              </article>
            );
          })}
        </div>

        {isBreeder ? (
          <div
            className={`seller-limit-banner${breederLimitReached ? ' seller-limit-banner--warning' : ''}`}
          >
            <strong>Quota account allevatore privato</strong>
            <p>
              {breederLimitReached
                ? 'Hai raggiunto il limite massimo di 3 annunci. Elimina o riutilizza una scheda esistente prima di crearne un altra.'
                : `Hai ancora ${breederSlotsLeft} slot disponibili sui 3 massimi previsti per questo account.`}
            </p>
          </div>
        ) : (
          <div className="seller-limit-banner seller-limit-banner--shelter">
            <strong>Gestione canile / rifugio</strong>
            <p>
              Il profilo canile puo pubblicare tutte le schede necessarie. Qui conta di piu tenere
              ordine, completezza e contesto delle richieste di affido.
            </p>
          </div>
        )}

        <div
          className={`seller-dashboard-shell${showDashboardLoader ? ' seller-dashboard-shell--muted' : ''}`}
        >
          <aside className="panel seller-dashboard-sidebar">
            <div className="seller-dashboard-sidebar__header">
              <div>
                <span className="seller-dashboard-sidebar__eyebrow">Libreria schede</span>
                <h3>{dashboardCopy.listTitle}</h3>
                <p>{dashboardCopy.createDescription}</p>
              </div>
              <button
                type="button"
                className="button button--primary"
                disabled={isBusy}
                onClick={openNewCard}
              >
                <Plus size={18} />
                {dashboardCopy.createLabel}
              </button>
            </div>

            <div className="managed-list">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className={`managed-card${openListingIds.includes(listing.id) ? ' managed-card--active' : ''}`}
                >
                  <div>
                    <strong>{listing.title}</strong>
                    <p>
                      {listing.breed} · {listing.city}
                    </p>
                  </div>
                  <div className="chip-row">
                    <span className="chip">{statusLabels[listing.status]}</span>
                    <span className="chip">{listing.images.length} immagini</span>
                  </div>
                  <div className="managed-card__actions">
                    <button
                      type="button"
                      className="button button--ghost"
                      disabled={isBusy}
                      onClick={() => openListingCard(listing.id)}
                    >
                      <PencilLine size={16} />
                      Apri card
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </aside>

          <div className="seller-dashboard-main seller-dashboard-main--stacked">
            {draftCards.map((draft) => (
              <ListingComposerCard
                key={draft.id}
                composerId={draft.id}
                title={dashboardCopy.createCardTitle}
                subtitle={dashboardCopy.createCardSubtitle}
                token={token}
                sellerMode={sellerMode}
                isBusy={isBusy}
                onClose={() =>
                  setDraftCards((current) => current.filter((item) => item.id !== draft.id))
                }
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onRestoreDraft={handleRestoreDraft}
              />
            ))}

            {openListings.map((listing) => (
              <ListingComposerCard
                key={listing.id}
                composerId={listing.id}
                title={
                  sellerMode === 'breeder' ? 'Modifica annuncio privato' : 'Modifica scheda affido'
                }
                subtitle="Questa card resta indipendente dalle altre schede aperte, cosi puoi lavorare senza conflitti di stato."
                token={token}
                sellerMode={sellerMode}
                isBusy={isBusy}
                initialListing={listing}
                onClose={() => closeListingCard(listing.id)}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onRestoreDraft={handleRestoreDraft}
              />
            ))}

            {draftCards.length === 0 && openListings.length === 0 ? (
              <article className="panel seller-composer seller-composer--empty">
                <div className="seller-composer__header">
                  <div>
                    <span className="seller-dashboard-sidebar__eyebrow">Editor scheda</span>
                    <h3>Nessuna card aperta</h3>
                    <p>Apri una scheda esistente oppure crea un nuovo annuncio per iniziare.</p>
                  </div>
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
