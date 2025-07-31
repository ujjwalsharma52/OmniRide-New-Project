
"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import VehicleSuggestionForm from "@/components/vehicle-suggestion-form";
import VehicleOptions from "@/components/vehicle-options";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingDialog } from "@/components/rating-dialog";
import RideStatusTracker from "@/components/ride-status-tracker";
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
    <div className="container max-w-2xl mx-auto py-8">
        <aside className="flex flex-col space-y-6">
            <VehicleSuggestionForm 
                onPickupChange={setPickup} 
                onDropoffChange={setDropoff} 
                onPassengerChange={setPassengerCount} 
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
    </div>
  );
}
