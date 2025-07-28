
"use client";

import { useEffect, useState } from "react";
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
import type { SuggestOptimalVehicleOutput } from "@/ai/schemas";

const formSchema = z.object({
  passengerCount: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(1, "At least 1 passenger")
    .max(10, "Maximum of 10 passengers"),
  cargoVolume: z.enum(["small", "medium", "large"]),
  trafficConditions: z.enum(["light", "moderate", "heavy"]),
});

type FormValues = z.infer<typeof formSchema>;


export default function VehicleSuggestionForm({ pickup, dropoff, onPassengerChange }: { pickup: string; dropoff: string; onPassengerChange: (count: number) => void; }) {
  const [suggestion, setSuggestion] = useState<SuggestOptimalVehicleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengerCount: 1,
      cargoVolume: "small",
      trafficConditions: "moderate",
    },
  });

  const { watch, setValue } = form;
  const passengerCount = watch("passengerCount");

  useEffect(() => {
    onPassengerChange(passengerCount);
  }, [passengerCount, onPassengerChange]);


  const handleSuggestion: SubmitHandler<FormValues> = async (data) => {
    if (!pickup || !dropoff) {
      form.setError("root", { message: "Please select pickup and dropoff locations on the map." });
      return;
    }
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
            <div className="space-y-2">
                <FormLabel>Pickup Location</FormLabel>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        readOnly 
                        value={pickup || "Select on map"}
                        className="pl-10 font-medium"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <FormLabel>Drop-off Location</FormLabel>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        readOnly 
                        value={dropoff || "Select on map"}
                        className="pl-10 font-medium"
                    />
                </div>
            </div>
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
            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
            )}
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
