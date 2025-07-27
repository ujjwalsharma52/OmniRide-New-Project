
"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import VehicleSuggestionForm from "@/components/vehicle-suggestion-form";
import VehicleOptions from "@/components/vehicle-options";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingDialog } from "@/components/rating-dialog";

export default function Home() {

  return (
    <div className="flex justify-center items-start">
      <aside className="w-full max-w-lg lg:h-full flex flex-col bg-card overflow-y-auto">
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
