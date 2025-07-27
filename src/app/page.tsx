
"use client";

import { useState } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import VehicleSuggestionForm from "@/components/vehicle-suggestion-form";
import VehicleOptions from "@/components/vehicle-options";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingDialog } from "@/components/rating-dialog";

export default function Home() {

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
       <section className="flex-1 w-full lg:h-full h-1/2 relative">
        <Image 
          src="https://placehold.co/600x400.png" 
          alt="Map placeholder" 
          layout="fill" 
          objectFit="cover"
          data-ai-hint="city map"
        />
        <div className="absolute inset-0 bg-black/20" />
      </section>
      <aside className="lg:w-[450px] lg:h-full flex flex-col border-t lg:border-t-0 lg:border-l bg-card overflow-y-auto h-1/2">
        <div className="p-6">
          <VehicleSuggestionForm />
        </div>
        <Separator />
        <div className="p-6 flex-1">
          <VehicleOptions />
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
    </div>
  );
}
