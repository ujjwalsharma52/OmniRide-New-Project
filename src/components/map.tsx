
'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
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
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
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

  if (loadError) {
    return (
      <Alert variant="destructive" className="h-full flex flex-col justify-center items-center text-center p-8">
        <AlertCircle className="h-12 w-12 mb-4" />
        <AlertTitle className="text-xl mb-2">Map Load Error</AlertTitle>
        <AlertDescription>
          There was a problem loading Google Maps. This usually happens if the API key is invalid or restricted.
          Please check your <code className="bg-destructive/20 px-1 rounded">.env</code> file and Google Cloud Console settings.
          <br /><br />
          Error Details: {loadError.message}
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
