'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { AlertCircle, Map as MapIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

const center = {
  lat: 28.6139,
  lng: 77.209,
};

interface MapProps {
  pickupCoords?: google.maps.LatLngLiteral | null;
  dropoffCoords?: google.maps.LatLngLiteral | null;
  onMapClick?: (latlng: google.maps.LatLngLiteral) => void;
}

export default function Map({ pickupCoords, dropoffCoords, onMapClick }: MapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && (pickupCoords || dropoffCoords)) {
      const bounds = new google.maps.LatLngBounds();
      if (pickupCoords) bounds.extend(pickupCoords);
      if (dropoffCoords) bounds.extend(dropoffCoords);
      
      if (pickupCoords && dropoffCoords) {
        map.fitBounds(bounds);
      } else {
        map.panTo(pickupCoords || dropoffCoords || center);
      }
    }
  }, [map, pickupCoords, dropoffCoords]);

  if (!apiKey) {
    return (
      <Card className="w-full h-full flex flex-col justify-center items-center text-center p-8 bg-muted/50 border-dashed">
        <MapIcon className="h-12 w-12 mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Map Preview Disabled</h3>
        <p className="text-muted-foreground text-sm">
          Please add a valid Google Maps API key to your <code className="bg-muted px-1 rounded">.env</code> file to enable the interactive map.
        </p>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Alert variant="destructive" className="h-full flex flex-col justify-center items-center text-center p-8 overflow-auto">
        <AlertCircle className="h-12 w-12 mb-4" />
        <AlertTitle className="text-xl mb-2">Map Load Error</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>There was a problem loading Google Maps. This usually happens if the API key is invalid or restricted.</p>
          <div className="bg-background/50 p-3 rounded text-left font-mono text-xs break-all">
            <strong>Error Message:</strong> {loadError.message}
          </div>
          <div className="text-sm text-muted-foreground border-t pt-4">
            <p className="font-semibold text-destructive">Diagnostic Note:</p>
            <p>The key provided appears to be in a RapidAPI format. The Google Maps JavaScript SDK requires a direct API Key from the Google Cloud Platform (usually starts with 'AIza').</p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!isLoaded) {
    return <Skeleton className="w-full h-full rounded-lg" />;
  }

  return (
    <Card className="w-full h-full overflow-hidden relative shadow-lg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={(e) => {
            if (e.latLng && onMapClick) {
                onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
        }}
        options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        }}
      >
        {pickupCoords && (
          <MarkerF
            position={pickupCoords}
            label={{ text: "P", color: "white" }}
            title="Pickup Location"
          />
        )}
        {dropoffCoords && (
          <MarkerF
            position={dropoffCoords}
            label={{ text: "D", color: "white" }}
            title="Drop-off Location"
          />
        )}
      </GoogleMap>
    </Card>
  );
}
