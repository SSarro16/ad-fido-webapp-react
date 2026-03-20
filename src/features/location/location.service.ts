import { env } from '../../services/env';

export type LocationSuggestion = {
  id: string;
  label: string;
  secondaryLabel?: string;
};

type GooglePrediction = {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type GoogleAutocompleteService = {
  getPlacePredictions: (
    request: {
      input: string;
      componentRestrictions?: { country: string | string[] };
      types?: string[];
    },
    callback: (predictions: GooglePrediction[] | null, status: string) => void
  ) => void;
};

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          AutocompleteService: new () => GoogleAutocompleteService;
          PlacesServiceStatus: {
            OK: string;
            ZERO_RESULTS: string;
          };
        };
      };
    };
    __adfidoGoogleMapsLoader?: Promise<void>;
  }
}

type LocationAutocompleteResponse = {
  suggestions?: LocationSuggestion[];
};

function hasUsableGoogleMapsKey() {
  return Boolean(
    env.googleMapsApiKey &&
    env.googleMapsApiKey !== 'your_server_side_google_maps_key' &&
    env.googleMapsApiKey !== 'change_me'
  );
}

async function loadGoogleMapsPlacesScript() {
  if (window.google?.maps?.places?.AutocompleteService) {
    return;
  }

  if (!hasUsableGoogleMapsKey()) {
    throw new Error('Google Maps API key non configurata.');
  }

  if (window.__adfidoGoogleMapsLoader) {
    return window.__adfidoGoogleMapsLoader;
  }

  window.__adfidoGoogleMapsLoader = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-google-maps-loader="adfido"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Google Maps non disponibile.')),
        {
          once: true,
        }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${env.googleMapsApiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = 'adfido';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps non disponibile.'));
    document.head.appendChild(script);
  });

  return window.__adfidoGoogleMapsLoader;
}

async function searchGoogleLocations(query: string, signal?: AbortSignal) {
  await loadGoogleMapsPlacesScript();

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const places = window.google?.maps?.places;
  if (!places?.AutocompleteService) {
    return [] as LocationSuggestion[];
  }

  const service = new places.AutocompleteService();

  const predictions = await new Promise<GooglePrediction[]>((resolve, reject) => {
    service.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'it' },
        types: ['(regions)'],
      },
      (results, status) => {
        if (status === places.PlacesServiceStatus.OK && results) {
          resolve(results);
          return;
        }

        if (status === places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
          return;
        }

        reject(new Error('Autocomplete Google Maps non disponibile.'));
      }
    );
  });

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  return predictions.map((prediction) => ({
    id: prediction.place_id,
    label: prediction.structured_formatting?.main_text ?? prediction.description,
    secondaryLabel: prediction.structured_formatting?.secondary_text,
  }));
}

async function searchBackendLocations(query: string, signal?: AbortSignal) {
  const response = await fetch(
    `${env.apiBaseUrl}/maps/autocomplete?input=${encodeURIComponent(query)}`,
    { signal }
  );

  if (response.status === 503) {
    return [] as LocationSuggestion[];
  }

  if (!response.ok) {
    throw new Error('Impossibile caricare i suggerimenti di localita.');
  }

  const payload = (await response.json()) as LocationAutocompleteResponse;
  return payload.suggestions ?? [];
}

export async function searchLocations(input: string, signal?: AbortSignal) {
  const query = input.trim();

  if (query.length < 2) {
    return [] as LocationSuggestion[];
  }

  try {
    const backendSuggestions = await searchBackendLocations(query, signal);

    if (backendSuggestions.length > 0) {
      return backendSuggestions;
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
  }

  if (hasUsableGoogleMapsKey()) {
    try {
      return await searchGoogleLocations(query, signal);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
    }
  }

  return [] as LocationSuggestion[];
}
