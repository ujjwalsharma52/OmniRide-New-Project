'use client';

import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import VehicleSuggestionForm from '@/components/vehicle-suggestion-form';
import VehicleOptions from '@/components/vehicle-options';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingDialog } from '@/components/rating-dialog';
import RideStatusTracker from '@/components/ride-status-tracker';
import Map from '@/components/map';

export default function Home() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [selectingFor, setSelectingFor] = useState<'pickup' | 'dropoff'>('pickup');

  const handleNewRide = (rideId: string) => {
    setActiveRideId(rideId);
  };

  const handleRideCompletion = () => {
    setActiveRideId(null);
  };

  const handleMapClick = (latlng: google.maps.LatLngLiteral) => {
    if (selectingFor === 'pickup') {
      setPickupCoords(latlng);
      setPickup(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    } else {
      setDropoffCoords(latlng);
      setDropoff(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    }
  };

  if (activeRideId) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] p-4">
        <RideStatusTracker rideId={activeRideId} onRideComplete={handleRideCompletion} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid lg:grid-cols-2 gap-8 min-h-[calc(100vh-8rem)]">
        <aside className="flex flex-col space-y-6">
          <VehicleSuggestionForm
            pickup={pickup}
            dropoff={dropoff}
            onPickupChange={setPickup}
            onDropoffChange={setDropoff}
            onPassengerChange={setPassengerCount}
            onSelectingForChange={setSelectingFor}
            selectingFor={selectingFor}
          />
          <Separator />
          <VehicleOptions
            pickup={pickup}
            dropoff={dropoff}
            passengerCount={passengerCount}
            onRideRequested={handleNewRide}
          />
          <div className="pt-6 border-t">
            <Card>
              <CardHeader>
                <CardTitle>Finished a ride?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Let us know how it went.</p>
                <RatingDialog />
              </CardContent>
            </Card>
          </div>
        </aside>

        <div className="h-[400px] lg:h-full min-h-[400px] sticky top-24">
          <Map 
            pickupCoords={pickupCoords} 
            dropoffCoords={dropoffCoords} 
            onMapClick={handleMapClick} 
          />
        </div>
      </div>
    </div>
  );
}