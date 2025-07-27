
"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { CarFront, Bike, Truck, Clock, IndianRupee, Car, Wallet, CreditCard, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createRideRequest } from "@/app/actions";

const vehicles = [
  {
    type: "Standard",
    icon: CarFront,
    eta: "5 min",
    ratePerKm: 15,
    image: "https://placehold.co/100x60.png",
    hint: "sedan car"
  },
  {
    type: "Moto",
    icon: Bike,
    eta: "3 min",
    ratePerKm: 8,
    image: "https://placehold.co/100x60.png",
    hint: "motorcycle"
  },
  {
    type: "Auto",
    icon: Car,
    eta: "4 min",
    ratePerKm: 12,
    image: "https://placehold.co/100x60.png",
    hint: "auto rickshaw"
  },
  {
    type: "SUV",
    icon: Car,
    eta: "7 min",
    ratePerKm: 20,
    image: "https://placehold.co/100x60.png",
    hint: "suv car"
  },
  {
    type: "XL",
    icon: Truck,
    eta: "8 min",
    ratePerKm: 25,
    image: "https://placehold.co/100x60.png",
    hint: "pickup truck"
  },
  {
    type: "Van",
    icon: Car,
    eta: "9 min",
    ratePerKm: 22,
    image: "https://placehold.co/100x60.png",
    hint: "van"
  },
  {
    type: "Luxury",
    icon: Star,
    eta: "6 min",
    ratePerKm: 35,
    image: "https://placehold.co/100x60.png",
    hint: "luxury car"
  },
];


export default function VehicleOptions({ pickup, dropoff, onRideRequested }: { pickup: string; dropoff: string; onRideRequested: (rideId: string) => void; }) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const distance = 10; // Default distance in km since map is removed

  const handleSelectVehicle = (vehicleType: string) => {
    setSelectedVehicle(vehicleType === selectedVehicle ? null : vehicleType);
  };
  
  const calculatePrice = (ratePerKm: number) => {
      if (!distance) return 0;
      const price = distance * ratePerKm;
      return price;
  }

  const handleRequestRide = async () => {
     if (!user) {
        toast({
            title: "Authentication Required",
            description: "Please log in to request a ride.",
            variant: "destructive",
        });
        router.push("/login");
        return;
    }

    if (!selectedVehicle) {
        toast({
            title: "No Vehicle Selected",
            description: "Please choose a vehicle for your ride.",
            variant: "destructive",
        });
        return;
    }
     if (!pickup || !dropoff) {
        toast({
            title: "Locations missing",
            description: "Please enter both pickup and dropoff locations.",
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);

    const vehicle = vehicles.find(v => v.type === selectedVehicle);
    if (!vehicle) return;

    const rideData = {
        userId: user.uid,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        vehicleType: vehicle.type,
        price: calculatePrice(vehicle.ratePerKm)
    };

    const result = await createRideRequest(rideData);

    if (result.success && result.rideId) {
         toast({
            title: "Ride Requested!",
            description: "We're finding a driver for you.",
        });
        onRideRequested(result.rideId);
        setSelectedVehicle(null);
    } else {
        toast({
            title: "Request Failed",
            description: result.error || "Could not request ride. Please try again.",
            variant: "destructive",
        });
    }

    setIsLoading(false);
  }

  return (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold">Choose a ride</h3>
        <div className="space-y-2">
            {vehicles.map((vehicle) => (
                <div key={vehicle.type}>
                    <Card 
                        className={cn(
                            "transition-all hover:shadow-md cursor-pointer",
                            selectedVehicle === vehicle.type ? "border-primary shadow-md" : "hover:border-primary/50"
                        )}
                        onClick={() => handleSelectVehicle(vehicle.type)}
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <Image src={vehicle.image} alt={vehicle.type} width={100} height={60} className="rounded-md" data-ai-hint={vehicle.hint} />
                            <div className="flex-1 space-y-1">
                                <h4 className="font-bold flex items-center gap-2">
                                    <vehicle.icon className="h-5 w-5" />
                                    {vehicle.type}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{vehicle.eta}</span>
                                    <span className="font-bold flex items-center gap-1"><IndianRupee className="h-3 w-3" />{calculatePrice(vehicle.ratePerKm).toFixed(2)}</span>
                                </div>
                            </div>
                             <Button variant={selectedVehicle === vehicle.type ? "default" : "outline"} className="w-24">
                                {selectedVehicle === vehicle.type ? "Selected" : "Select"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
        {selectedVehicle && (
            <Button onClick={handleRequestRide} className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : `Request ${selectedVehicle}`}
            </Button>
        )}
    </div>
  );
}
