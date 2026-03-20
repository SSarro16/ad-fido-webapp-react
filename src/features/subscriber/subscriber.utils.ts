import type { ManagedListingInput } from '../../types/subscriber';

export function validateManagedListing(input: ManagedListingInput) {
  const errors: string[] = [];
  const uniqueImages = new Set(input.images);

  if (!input.title.trim()) {
    errors.push('Il nome annuncio è obbligatorio.');
  }

  if (!input.coverImage.trim()) {
    errors.push('L immagine cover è obbligatoria.');
  }

  if (!input.images.includes(input.coverImage)) {
    errors.push('La cover deve essere inclusa tra le immagini.');
  }

  if (input.images.length === 0) {
    errors.push('Inserisci almeno un immagine.');
  }

  if (input.images.length > 8) {
    errors.push('Puoi caricare massimo 8 immagini.');
  }

  if (uniqueImages.size !== input.images.length) {
    errors.push('Non sono consentite immagini duplicate.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
