"use client";

import { useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Separator } from "@/components/ui/separator";
import GoogleMap from "@/components/google-map";
import VehicleSuggestionForm from "@/components/vehicle-suggestion-form";
import VehicleOptions from "@/components/vehicle-options";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingDialog } from "@/components/rating-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export interface Location {
  lat: number;
  lng: number;
}

const libraries: "places"[] = ["places"];

export default function Home() {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  return (
    <div className="h-[calc(100vh-4rem)] grid lg:grid-cols-[450px_1fr]">
      <aside className="flex flex-col border-r bg-card overflow-y-auto">
        <div className="p-6">
          {isLoaded ? (
            <VehicleSuggestionForm
              pickup={pickup}
              dropoff={dropoff}
              setPickup={setPickup}
              setDropoff={setDropoff}
            />
          ) : (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
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
        {isLoaded ? (
          <GoogleMap
            pickup={pickup}
            dropoff={dropoff}
            setPickup={setPickup}
            setDropoff={setDropoff}
            setDistance={setDistance}
          />
        ) : (
          <Skeleton className="w-full h-full" />
        )}
      </section>
    </div>
  );
}
