"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lightbulb, Loader2, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getVehicleSuggestion } from "@/app/actions";
import type { SuggestOptimalVehicleOutput } from "@/ai/flows/suggest-optimal-vehicle";
import type { Location } from "@/app/page";

const formSchema = z.object({
  pickup: z.string().min(1, "Pickup location is required"),
  dropoff: z.string().min(1, "Dropoff location is required"),
  passengerCount: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(1, "At least 1 passenger")
    .max(10, "Maximum of 10 passengers"),
  cargoVolume: z.enum(["small", "medium", "large"]),
  trafficConditions: z.enum(["light", "moderate", "heavy"]),
});

type FormValues = z.infer<typeof formSchema>;

interface VehicleSuggestionFormProps {
  pickup: Location | null;
  dropoff: Location | null;
  setPickup: (location: Location | null) => void;
  setDropoff: (location: Location | null) => void;
}

export default function VehicleSuggestionForm({ pickup, dropoff, setPickup, setDropoff }: VehicleSuggestionFormProps) {
  const [suggestion, setSuggestion] = useState<SuggestOptimalVehicleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (lat: number, lng: number) => {
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].formatted_address;
        }
        return "Unknown Location";
    } catch (error) {
        console.error("Geocoding error:", error);
        return "Error fetching address";
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickup: "",
      dropoff: "",
      passengerCount: 1,
      cargoVolume: "small",
      trafficConditions: "moderate",
    },
  });

  useEffect(() => {
    if (pickup) {
        geocode(pickup.lat, pickup.lng).then(address => {
            form.setValue("pickup", address);
        });
    }
  }, [pickup, form, geocode]);

  useEffect(() => {
    if (dropoff) {
        geocode(dropoff.lat, dropoff.lng).then(address => {
            form.setValue("dropoff", address);
        });
    }
  }, [dropoff, form, geocode]);


  const handleSuggestion: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const result = await getVehicleSuggestion({
        ...data,
        passengerCount: Number(data.passengerCount),
      });
      setSuggestion(result);
    } catch (e) {
      setError("Failed to get suggestion. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Where to?</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSuggestion)} className="space-y-4">
          <FormField
            control={form.control}
            name="pickup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="Click map or enter pickup location" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dropoff"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drop-off Location</FormLabel>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="Click map or enter destination" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="passengerCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passengers</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cargoVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cargo size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
            <FormField
                control={form.control}
                name="trafficConditions"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Current Traffic</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select traffic conditions" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="heavy">Heavy</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                Suggest Optimal Vehicle
            </Button>
        </form>
      </Form>
      
      {suggestion && (
        <Alert className="mt-6 bg-primary/10 border-primary/20">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary font-bold">AI Suggestion: {suggestion.vehicleSuggestion}</AlertTitle>
            <AlertDescription className="text-primary/90">
                {suggestion.reasoning}
            </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {error}
            </AlertDescription>
        </Alert>
      )}

    </div>
  );
}
