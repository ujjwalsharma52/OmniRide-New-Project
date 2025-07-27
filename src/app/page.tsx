
"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import VehicleSuggestionForm from "@/components/vehicle-suggestion-form";
import VehicleOptions from "@/components/vehicle-options";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingDialog } from "@/components/rating-dialog";
import RideStatusTracker from "@/components/ride-status-tracker";

export default function Home() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [activeRideId, setActiveRideId] = useState<string | null>(null);

  const handleLocationsChange = (pickup: string, dropoff: string) => {
    setPickup(pickup);
    setDropoff(dropoff);
  };
  
  const handleNewRide = (rideId: string) => {
    setActiveRideId(rideId);
  }

  const handleRideCompletion = () => {
    setActiveRideId(null);
  }

  return (
    <div className="flex justify-center items-start p-4">
      {activeRideId ? (
        <RideStatusTracker rideId={activeRideId} onRideComplete={handleRideCompletion} />
      ) : (
        <aside className="w-full max-w-lg lg:h-full flex flex-col bg-card overflow-y-auto rounded-lg shadow-lg border">
          <div className="p-6">
            <VehicleSuggestionForm onLocationsChange={handleLocationsChange} />
          </div>
          <Separator />
          <div className="p-6 flex-1">
            <VehicleOptions pickup={pickup} dropoff={dropoff} onRideRequested={handleNewRide} />
          </div>
          <div className="p-6 border-t">
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
      )}
    </div>
  );
}
