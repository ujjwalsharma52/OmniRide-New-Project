import { Separator } from "@/components/ui/separator";
import MapPlaceholder from "@/components/map-placeholder";
import VehicleSuggestionForm from "@/components/vehicle-suggestion-form";
import VehicleOptions from "@/components/vehicle-options";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingDialog } from "@/components/rating-dialog";

export default function Home() {
  return (
    <div className="h-[calc(100vh-4rem)] grid lg:grid-cols-[450px_1fr]">
      <aside className="flex flex-col border-r bg-card overflow-y-auto">
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
      <section className="hidden lg:block">
        <MapPlaceholder />
      </section>
    </div>
  );
}
