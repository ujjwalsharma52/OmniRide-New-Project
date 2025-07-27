"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import GoogleMap from "@/components/google-map";
import VehicleSuggestionForm from "@/components/vehicle-suggestion-form";
import VehicleOptions from "@/components/vehicle-options";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingDialog } from "@/components/rating-dialog";

export interface Location {
  lat: number;
  lng: number;
}

export default function Home() {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  return (
    <div className="h-[calc(100vh-4rem)] grid lg:grid-cols-[450px_1fr]">
      <aside className="flex flex-col border-r bg-card overflow-y-auto">
        <div className="p-6">
          <VehicleSuggestionForm
            pickup={pickup}
            dropoff={dropoff}
            setPickup={setPickup}
            setDropoff={setDropoff}
          />
        </div>
        <Separator />
        <div className="p-6 flex-1">
          <VehicleOptions distance={distance} />
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
      <section className="hidden lg:block">
        <GoogleMap
          pickup={pickup}
          dropoff={dropoff}
          setPickup={setPickup}
          setDropoff={setDropoff}
          setDistance={setDistance}
        />
      </section>
    </div>
  );
}
