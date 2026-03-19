
'use client';

import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lightbulb, Loader2, MapPin, Send, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getVehicleSuggestion } from '@/app/actions';
import type { SuggestOptimalVehicleOutput } from '@/ai/schemas';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  pickup: z.string().min(1, 'Pickup location is required'),
  dropoff: z.string().min(1, 'Dropoff location is required'),
  passengerCount: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(1, 'At least 1 passenger')
    .max(10, 'Maximum of 10 passengers'),
  cargoVolume: z.enum(['small', 'medium', 'large']),
  trafficConditions: z.enum(['light', 'moderate', 'heavy']),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  pickup: string;
  dropoff: string;
  onPickupChange: (val: string) => void;
  onDropoffChange: (val: string) => void;
  onPassengerChange: (count: number) => void;
  onSelectingForChange: (type: 'pickup' | 'dropoff') => void;
  selectingFor: 'pickup' | 'dropoff';
}

export default function VehicleSuggestionForm({
  pickup,
  dropoff,
  onPickupChange,
  onDropoffChange,
  onPassengerChange,
  onSelectingForChange,
  selectingFor,
}: Props) {
  const [suggestion, setSuggestion] = useState<SuggestOptimalVehicleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickup: pickup || '',
      dropoff: dropoff || '',
      passengerCount: 1,
      cargoVolume: 'small',
      trafficConditions: 'moderate',
    },
  });

  const { watch, setValue } = form;
  const passengerCount = watch('passengerCount');

  // Sync external pickup/dropoff props to form
  useEffect(() => {
    setValue('pickup', pickup);
  }, [pickup, setValue]);

  useEffect(() => {
    setValue('dropoff', dropoff);
  }, [dropoff, setValue]);

  useEffect(() => {
    onPassengerChange(passengerCount);
  }, [passengerCount, onPassengerChange]);

  const handleSuggestion: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const result = await getVehicleSuggestion({
        passengerCount: Number(data.passengerCount),
        cargoVolume: data.cargoVolume,
        trafficConditions: data.trafficConditions,
      });
      setSuggestion(result);
    } catch (e) {
      setError('Failed to get suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Where to?</h2>
        <div className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground flex items-center gap-1">
          <MousePointer2 className="h-3 w-3" /> Select on map
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSuggestion)} className="space-y-4">
          <FormField
            control={form.control}
            name="pickup"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-between items-center">
                  Pickup Location
                  <Button
                    type="button"
                    variant={selectingFor === 'pickup' ? 'default' : 'ghost'}
                    size="xs"
                    className="h-6 text-[10px] px-2"
                    onClick={() => onSelectingForChange('pickup')}
                  >
                    Select here
                  </Button>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                        selectingFor === 'pickup' ? "text-primary" : "text-muted-foreground"
                    )} />
                    <Input
                      placeholder="Enter pickup address"
                      className={cn("pl-10", selectingFor === 'pickup' && "border-primary ring-1 ring-primary")}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onPickupChange(e.target.value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dropoff"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-between items-center">
                  Drop-off Location
                  <Button
                    type="button"
                    variant={selectingFor === 'dropoff' ? 'default' : 'ghost'}
                    size="xs"
                    className="h-6 text-[10px] px-2"
                    onClick={() => onSelectingForChange('dropoff')}
                  >
                    Select here
                  </Button>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                        selectingFor === 'dropoff' ? "text-primary" : "text-muted-foreground"
                    )} />
                    <Input
                      placeholder="Enter dropoff address"
                      className={cn("pl-10", selectingFor === 'dropoff' && "border-primary ring-1 ring-primary")}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onDropoffChange(e.target.value);
                      }}
                    />
                  </div>
                </FormControl>
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
        <Alert className="mt-6 bg-primary/10 border-primary/20 animate-in slide-in-from-top-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-bold">
            AI Suggestion: {suggestion.vehicleSuggestion}
          </AlertTitle>
          <AlertDescription className="text-primary/90">
            {suggestion.reasoning}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
