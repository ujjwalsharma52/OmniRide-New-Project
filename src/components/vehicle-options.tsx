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
    price: "150.50",
    image: "https://placehold.co/100x60.png",
    hint: "sedan car"
  },
  {
    type: "Moto",
    icon: Bike,
    eta: "3 min",
    price: "80.00",
    image: "https://placehold.co/100x60.png",
    hint: "motorcycle"
  },
  {
    type: "Auto",
    icon: Car,
    eta: "4 min",
    price: "100.20",
    image: "https://placehold.co/100x60.png",
    hint: "auto rickshaw"
  },
  {
    type: "SUV",
    icon: Car,
    eta: "7 min",
    price: "200.00",
    image: "https://placehold.co/100x60.png",
    hint: "suv car"
  },
  {
    type: "XL",
    icon: Truck,
    eta: "8 min",
    price: "250.00",
    image: "https://placehold.co/100x60.png",
    hint: "pickup truck"
  },
];

export default function VehicleOptions() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const handleSelectVehicle = (vehicleType: string) => {
    setSelectedVehicle(vehicleType === selectedVehicle ? null : vehicleType);
  };

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
                                    <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{vehicle.price}</span>
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
