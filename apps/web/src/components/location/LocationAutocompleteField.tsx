import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { TextField, type TextFieldProps } from '@mui/material';

type GooglePlaceResult = {
  formatted_address?: string;
  name?: string;
  place_id?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
};

type GoogleAutocompleteInstance = {
  addListener: (eventName: 'place_changed', handler: () => void) => { remove?: () => void };
  getPlace: () => GooglePlaceResult;
};

type GooglePlacesWindow = Window & {
  google?: {
    maps?: {
      places?: {
        Autocomplete: new (input: HTMLInputElement, options?: Record<string, unknown>) => GoogleAutocompleteInstance;
      };
    };
  };
};

interface LocationAutocompleteFieldProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: {
    location: string;
    formattedAddress?: string;
    placeId?: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  googleMapsApiKey?: string;
}

export function LocationAutocompleteField({
  value,
  onChange,
  onPlaceSelected,
  googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  helperText,
  ...textFieldProps
}: LocationAutocompleteFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsFailed, setMapsFailed] = useState(false);

  useEffect(() => {
    const googleObj = typeof window !== 'undefined' ? (window as GooglePlacesWindow).google : undefined;
    if (googleObj?.maps?.places) {
      setMapsLoaded(true);
      setMapsFailed(false);
    }
  }, []);

  useEffect(() => {
    if (!mapsLoaded || !inputRef.current || typeof window === 'undefined') return;

    const googleObj = (window as GooglePlacesWindow).google;
    const Autocomplete = googleObj?.maps?.places?.Autocomplete;
    if (!Autocomplete) return;

    const autocomplete = new Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'name', 'geometry', 'place_id'],
      types: ['geocode'],
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const latitude = place.geometry?.location?.lat?.();
      const longitude = place.geometry?.location?.lng?.();
      const bestAddress = place.formatted_address || place.name || inputRef.current?.value || '';

      onChange(bestAddress);
      onPlaceSelected?.({
        location: bestAddress,
        formattedAddress: place.formatted_address || bestAddress || undefined,
        placeId: place.place_id,
        latitude: typeof latitude === 'number' ? latitude : undefined,
        longitude: typeof longitude === 'number' ? longitude : undefined,
      });
    });

    return () => {
      if (listener && typeof listener.remove === 'function') listener.remove();
    };
  }, [mapsLoaded, onChange, onPlaceSelected]);

  const autocompleteHelperText = helperText || (
    googleMapsApiKey && !mapsFailed
      ? 'Empieza a escribir y selecciona una sugerencia de Google Maps.'
      : 'Escribe la ubicación manualmente.'
  );

  return (
    <>
      {googleMapsApiKey && (
        <Script
          id="google-maps-js"
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&loading=async`}
          strategy="afterInteractive"
          onLoad={() => {
            setMapsLoaded(true);
            setMapsFailed(false);
          }}
          onError={() => setMapsFailed(true)}
        />
      )}
      <TextField
        {...textFieldProps}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputRef={inputRef}
        helperText={autocompleteHelperText}
      />
    </>
  );
}
