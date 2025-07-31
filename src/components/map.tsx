
"use client";

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useIsClient } from '@/hooks/useIsClient';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useTheme } from 'next-themes';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default center to a location in India
const center = {
  lat: 20.5937,
  lng: 78.9629
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#7c93a3"
                },
                {
                    "lightness": "-10"
                }
            ]
        },
        {
            "featureType": "administrative.country",
            "elementType": "geometry",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "administrative.country",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#a0a4a5"
                }
            ]
        },
        {
            "featureType": "administrative.province",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#62838e"
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#f2f4f6"
                }
            ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#dce2e3"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 45
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#c6c9ce"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text",
            "stylers": [
                {
                    "color": "#4e4e4e"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#787878"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "transit.station.airport",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "hue": "#0a00ff"
                },
                {
                    "saturation": "-77"
                },
                {
                    "gamma": "2.15"
                },
                {
                    "lightness": "12"
                }
            ]
        },
        {
            "featureType": "transit.station.rail",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#43321e"
                }
            ]
        },
        {
            "featureType": "transit.station.rail",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "hue": "#ff6c00"
                },
                {
                    "lightness": "4"
                },
                {
                    "gamma": "0.75"
                },
                {
                    "saturation": "-68"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "color": "#e0eaf1"
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#a6cbe3"
                }
            ]
        }
    ]
};

const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
];

type MapProps = {
    setPickup: (address: string) => void;
    setDropoff: (address: string) => void;
}

function Map({ setPickup, setDropoff }: MapProps) {
    const isClient = useIsClient();
    const { resolvedTheme } = useTheme();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  const [map, setMap] = useState(null);
  const [pickupMarker, setPickupMarker] = useState<google.maps.LatLngLiteral | null>(null);
  const [dropoffMarker, setDropoffMarker] = useState<google.maps.LatLngLiteral | null>(null);
  const [currentSelection, setCurrentSelection] = useState<'pickup' | 'dropoff'>('pickup');
  

  const getAddress = useCallback((latLng: google.maps.LatLngLiteral, selection: 'pickup' | 'dropoff') => {
    if (typeof window === 'undefined' || !window.google) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const address = results[0].formatted_address;
        if (selection === 'pickup') {
          setPickup(address);
        } else {
          setDropoff(address);
        }
      } else {
        console.error('Geocoder failed due to: ' + status);
        const fallbackAddress = `Lat: ${latLng.lat.toFixed(4)}, Lng: ${latLng.lng.toFixed(4)}`;
         if (selection === 'pickup') {
          setPickup(fallbackAddress);
        } else {
          setDropoff(fallbackAddress);
        }
      }
    });
  }, [setPickup, setDropoff]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newLocation = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    if (currentSelection === 'pickup') {
      setPickupMarker(newLocation);
      getAddress(newLocation, 'pickup');
      setCurrentSelection('dropoff');
    } else {
      setDropoffMarker(newLocation);
      getAddress(newLocation, 'dropoff');
      setCurrentSelection('pickup');
    }
  }, [currentSelection, getAddress]);


  if (loadError) {
    return (
        <div className="h-full w-full flex items-center justify-center bg-muted/50 p-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Map Error</AlertTitle>
                <AlertDescription>
                   Google Maps failed to load. This is usually due to a missing or misconfigured API key. Please check the following:
                   <ul className="list-disc pl-5 mt-2">
                       <li>Ensure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set in your environment.</li>
                       <li>Verify the API key is correct in your Google Cloud project.</li>
                       <li>Make sure the "Maps JavaScript API" is enabled in your project.</li>
                       <li>Confirm that billing is enabled for your Google Cloud project.</li>
                   </ul>
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  if (!isClient) {
     return <div className="h-full w-full flex items-center justify-center bg-muted/50"><p>Loading Map...</p></div>
  }

  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
        options={{...mapOptions, styles: resolvedTheme === 'dark' ? darkMapStyles : mapOptions.styles}}
        onClick={onMapClick}
      >
        {pickupMarker && (
            <MarkerF position={pickupMarker} label="P" />
        )}
        {dropoffMarker && (
            <MarkerF position={dropoffMarker} label="D" />
        )}
      </GoogleMap>
  ) : <div className="h-full w-full flex items-center justify-center bg-muted/50"><p>Loading Map...</p></div>
}

export default Map;
