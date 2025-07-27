"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { CarFront, Bike, Truck, Clock, IndianRupee, Car, Wallet, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

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
];

interface VehicleOptionsProps {
    distance: number | null;
}

export default function VehicleOptions({ distance }: VehicleOptionsProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const handleSelectVehicle = (vehicleType: string) => {
    setSelectedVehicle(vehicleType === selectedVehicle ? null : vehicleType);
  };
  
  const calculatePrice = (ratePerKm: number) => {
      if (!distance) return "N/A";
      const price = distance * ratePerKm;
      return price.toFixed(2);
  }

  return (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold">Choose a ride</h3>
        {!distance && (
            <div className="text-center text-muted-foreground py-8">
                <p>Please select pickup and drop-off locations to see ride options.</p>
            </div>
        )}
        <div className="space-y-2">
            {distance && vehicles.map((vehicle) => (
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
                                    <span className="font-bold flex items-center gap-1"><IndianRupee className="h-3 w-3" />{calculatePrice(vehicle.ratePerKm)}</span>
                                </div>
                            </div>
                             <Button variant={selectedVehicle === vehicle.type ? "default" : "outline"}>
                                {selectedVehicle === vehicle.type ? "Selected" : "Select"}
                            </Button>
                        </CardContent>
                    </Card>
                    {selectedVehicle === vehicle.type && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                             <Button variant="secondary">
                                <Wallet className="mr-2" /> Pay with Cash
                            </Button>
                            <Button>
                                <CreditCard className="mr-2" /> Pay Online
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
}
