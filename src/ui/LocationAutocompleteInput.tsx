import { LoaderCircle, MapPin } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

import { useAppHealth } from '../features/app/app.queries';
import { searchLocations, type LocationSuggestion } from '../features/location/location.service';

type LocationAutocompleteInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  name?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  showIcon?: boolean;
};

export function LocationAutocompleteInput({
  value,
  onChange,
  placeholder = 'Citta, regione o provincia',
  label,
  name,
  wrapperClassName,
  labelClassName,
  showIcon = true,
}: LocationAutocompleteInputProps) {
  const listboxId = useId();
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { data: appHealth, isError: appHealthError } = useAppHealth();

  const showMapsStatus = Boolean(appHealth && !appHealth.mapsConfigured) || appHealthError;

  function commitSuggestion(suggestion: LocationSuggestion) {
    onChange(suggestion.label);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  useEffect(() => {
    if (value.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        const nextSuggestions = await searchLocations(value, controller.signal);
        setSuggestions(nextSuggestions);
        setIsOpen(nextSuggestions.length > 0);
        setActiveIndex(nextSuggestions.length > 0 ? 0 : -1);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setSuggestions([]);
          setIsOpen(false);
          setActiveIndex(-1);
        }
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  return (
    <label className={wrapperClassName ? `location-input ${wrapperClassName}` : 'location-input'}>
      {label ? <span className={labelClassName}>{label}</span> : null}

      <div className="location-input__wrap">
        <div
          className={`location-input__control${showIcon ? '' : ' location-input__control--no-icon'}`}
        >
          {showIcon ? (
            <span className="location-input__icon" aria-hidden="true">
              <MapPin size={18} />
            </span>
          ) : null}
          <input
            className="location-input__field"
            name={name}
            value={value}
            autoComplete="off"
            placeholder={placeholder}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={
              isOpen && activeIndex >= 0
                ? `${listboxId}-option-${suggestions[activeIndex]?.id}`
                : undefined
            }
            onChange={(event) => {
              onChange(event.target.value);
              setIsOpen(true);
              setActiveIndex(0);
            }}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 120);
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setIsOpen(true);
              }
            }}
            onKeyDown={(event) => {
              if (!isOpen || suggestions.length === 0) {
                return;
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((current) => (current + 1) % suggestions.length);
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
              }

              if (event.key === 'Enter' && activeIndex >= 0) {
                event.preventDefault();
                commitSuggestion(suggestions[activeIndex]!);
              }

              if (event.key === 'Escape') {
                setIsOpen(false);
                setActiveIndex(-1);
              }
            }}
          />
          {isLoading ? <LoaderCircle size={16} className="location-input__spinner" /> : null}
        </div>
      </div>

      {isOpen && suggestions.length > 0 ? (
        <div className="location-input__popover" role="listbox" id={listboxId}>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              id={`${listboxId}-option-${suggestion.id}`}
              type="button"
              className="location-input__option"
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                commitSuggestion(suggestion);
              }}
            >
              <strong>{suggestion.label}</strong>
              {suggestion.secondaryLabel ? <span>{suggestion.secondaryLabel}</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      {showMapsStatus ? (
        <span
          className={`location-input__status${appHealthError ? ' location-input__status--warning' : ''}`}
        >
          {appHealthError
            ? 'Servizio localita temporaneamente non disponibile.'
            : 'Suggerimenti localita non attivi: riavvia il backend dopo la configurazione Google Maps.'}
        </span>
      ) : null}
    </label>
  );
}
