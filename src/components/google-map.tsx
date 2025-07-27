"use client";

import { useState, useCallback, useEffect } from "react";
import {
  GoogleMap as GoogleMapApi,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import type { Location } from "@/app/page";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.209,
};

interface GoogleMapProps {
  pickup: Location | null;
  dropoff: Location | null;
  setPickup: (location: Location) => void;
  setDropoff: (location: Location) => void;
  setDistance: (distance: number | null) => void;
}

export default function GoogleMap({
  pickup,
  dropoff,
  setPickup,
  setDropoff,
  setDistance,
}: GoogleMapProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const newLocation = { lat: e.latLng.lat(), lng: e.latLng.lng() };

      if (!pickup) {
        setPickup(newLocation);
      } else if (!dropoff) {
        setDropoff(newLocation);
      }
    },
    [pickup, dropoff, setPickup, setDropoff]
  );
  
  const calculateRoute = useCallback(() => {
    if (pickup && dropoff) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: new window.google.maps.LatLng(pickup.lat, pickup.lng),
          destination: new window.google.maps.LatLng(dropoff.lat, dropoff.lng),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            if (result?.routes?.[0]?.legs?.[0]?.distance?.value) {
              const distanceInMeters = result.routes[0].legs[0].distance.value;
              setDistance(distanceInMeters / 1000); // Convert to kilometers
            }
          } else {
            console.error(`error fetching directions ${result}`);
            setDistance(null);
          }
        }
      );
    } else {
        setDirections(null);
        setDistance(null);
    }
  }, [pickup, dropoff, setDistance]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  return (
    <GoogleMapApi
      mapContainerStyle={containerStyle}
      center={pickup || defaultCenter}
      zoom={12}
      onClick={onMapClick}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {pickup && <Marker position={pickup} label="P" />}
      {dropoff && <Marker position={dropoff} label="D" />}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMapApi>
  );
}
