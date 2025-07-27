import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CarFront, Bike, Truck, Clock, DollarSign, Car } from "lucide-react";

const vehicles = [
  {
    type: "Standard",
    icon: CarFront,
    eta: "5 min",
    price: "12.50",
    image: "https://placehold.co/100x60.png",
    hint: "sedan car"
  },
  {
    type: "Moto",
    icon: Bike,
    eta: "3 min",
    price: "7.80",
    image: "https://placehold.co/100x60.png",
    hint: "motorcycle"
  },
  {
    type: "Auto",
    icon: Car,
    eta: "4 min",
    price: "9.20",
    image: "https://placehold.co/100x60.png",
    hint: "auto rickshaw"
  },
  {
    type: "SUV",
    icon: Car,
    eta: "7 min",
    price: "18.00",
    image: "https://placehold.co/100x60.png",
    hint: "suv car"
  },
  {
    type: "XL",
    icon: Truck,
    eta: "8 min",
    price: "20.00",
    image: "https://placehold.co/100x60.png",
    hint: "pickup truck"
  },
];

export default function VehicleOptions() {
  return (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold">Choose a ride</h3>
        <div className="space-y-4">
            {vehicles.map((vehicle, index) => (
                <Card key={index} className="transition-all hover:shadow-md hover:border-primary">
                    <CardContent className="p-4 flex items-center gap-4">
                        <Image src={vehicle.image} alt={vehicle.type} width={100} height={60} className="rounded-md" data-ai-hint={vehicle.hint} />
                        <div className="flex-1 space-y-1">
                            <h4 className="font-bold flex items-center gap-2">
                                <vehicle.icon className="h-5 w-5" />
                                {vehicle.type}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{vehicle.eta}</span>
                                <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{vehicle.price}</span>
                            </div>
                        </div>
                        <Button>Select</Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
