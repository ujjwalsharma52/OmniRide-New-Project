
"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import VehicleSuggestionForm from "@/components/vehicle-suggestion-form";
import VehicleOptions from "@/components/vehicle-options";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingDialog } from "@/components/rating-dialog";
import RideStatusTracker from "@/components/ride-status-tracker";
import Map from "@/components/map";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  if (activeRideId) {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-4rem)] p-4">
             <RideStatusTracker rideId={activeRideId} onRideComplete={handleRideCompletion} />
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-4rem)]">
      <aside className="flex flex-col">
        <ScrollArea className="h-full">
            <div className="p-6">
                <VehicleSuggestionForm pickup={pickup} dropoff={dropoff} onPassengerChange={setPassengerCount} />
            </div>
            <Separator />
            <div className="p-6">
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
        </ScrollArea>
      </aside>
      <main className="h-full w-full">
        <Map setPickup={setPickup} setDropoff={setDropoff} />
      </main>
    </div>
  );
}
