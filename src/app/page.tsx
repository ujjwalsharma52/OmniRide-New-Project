
"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import VehicleSuggestionForm from "@/components/vehicle-suggestion-form";
import VehicleOptions from "@/components/vehicle-options";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingDialog } from "@/components/rating-dialog";
import RideStatusTracker from "@/components/ride-status-tracker";
import Map from "@/components/map";

export default function Home() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);

  const handleNewRide = (rideId: string) => {
    setActiveRideId(rideId);
  }

  const handleRideCompletion = () => {
    setActiveRideId(null);
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <Map setPickup={setPickup} setDropoff={setDropoff} />
      <div className="absolute top-0 left-0 h-full w-full pointer-events-none">
        <div className="p-4 h-full">
            {activeRideId ? (
                <div className="flex justify-center items-center h-full">
                     <RideStatusTracker rideId={activeRideId} onRideComplete={handleRideCompletion} />
                </div>
            ) : (
                <aside className="w-full max-w-md h-full flex flex-col bg-card/90 backdrop-blur-sm overflow-y-auto rounded-lg shadow-lg border pointer-events-auto">
                    <div className="p-6">
                        <VehicleSuggestionForm pickup={pickup} dropoff={dropoff} onPassengerChange={setPassengerCount} />
                    </div>
                    <Separator />
                    <div className="p-6 flex-1">
                        <VehicleOptions 
                        pickup={pickup} 
                        dropoff={dropoff} 
                        passengerCount={passengerCount}
                        onRideRequested={handleNewRide} 
                        />
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
      </div>
    </div>
  );
}
