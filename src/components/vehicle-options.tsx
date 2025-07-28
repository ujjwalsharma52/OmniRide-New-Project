
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { CarFront, Bike, Truck, Clock, IndianRupee, Car, Wallet, CreditCard, Star, Loader2, Users, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createRideRequest } from "@/app/actions";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

declare global {
    interface Window {
        Razorpay: any;
    }
}

const vehicles = [
  {
    type: "Standard",
    icon: CarFront,
    eta: "5 min",
    ratePerKm: 15,
    capacity: 4,
    image: "https://placehold.co/100x60.png",
    hint: "sedan car"
  },
  {
    type: "Moto",
    icon: Bike,
    eta: "3 min",
    ratePerKm: 8,
    capacity: 1,
    image: "https://placehold.co/100x60.png",
    hint: "motorcycle"
  },
  {
    type: "Auto",
    icon: Car,
    eta: "4 min",
    ratePerKm: 12,
    capacity: 3,
    image: "https://placehold.co/100x60.png",
    hint: "auto rickshaw"
  },
  {
    type: "SUV",
    icon: Car,
    eta: "7 min",
    ratePerKm: 20,
    capacity: 6,
    image: "https://placehold.co/100x60.png",
    hint: "suv car"
  },
  {
    type: "XL",
    icon: Truck,
    eta: "8 min",
    ratePerKm: 25,
    capacity: 7,
    image: "https://placehold.co/100x60.png",
    hint: "pickup truck"
  },
  {
    type: "Van",
    icon: Car,
    eta: "9 min",
    ratePerKm: 22,
    capacity: 8,
    image: "https://placehold.co/100x60.png",
    hint: "van"
  },
  {
    type: "Luxury",
    icon: Star,
    eta: "6 min",
    ratePerKm: 35,
    capacity: 3,
    image: "https://placehold.co/100x60.png",
    hint: "luxury car"
  },
];


export default function VehicleOptions({ pickup, dropoff, passengerCount, onRideRequested }: { pickup: string; dropoff: string; passengerCount: number; onRideRequested: (rideId: string) => void; }) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [seats, setSeats] = useState(passengerCount);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const distance = 10; // Default distance in km since map is removed

  useEffect(() => {
    setSeats(passengerCount);
  }, [passengerCount])

  const handleSelectVehicle = (vehicleType: string) => {
    setSelectedVehicle(vehicleType === selectedVehicle ? null : vehicleType);
    const vehicle = vehicles.find(v => v.type === vehicleType);
    if(vehicle) {
        setSeats(Math.min(passengerCount, vehicle.capacity));
    }
  };
  
  const calculatePrice = (ratePerKm: number, numSeats: number) => {
      if (!distance) return 0;
      // Simple price calculation, could be more complex (e.g. base fare + per km + per seat)
      const price = distance * ratePerKm * (numSeats / (vehicles.find(v => v.type === selectedVehicle)?.capacity || 1));
      return Math.max(price, ratePerKm * 0.5); // Ensure a minimum price
  }

  const handleRequestRide = async () => {
     if (!user || !userProfile) {
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
    if (!vehicle) {
        setIsLoading(false);
        return;
    }

    const rideData = {
        userId: user.uid,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        vehicleType: vehicle.type,
        price: calculatePrice(vehicle.ratePerKm, seats),
        passengerCount: seats
    };
    
    // In a real app, you would create an order on your server and get an order_id
    // For this simulation, we'll proceed directly to payment
    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rideData.price * 100, // Amount in paise
        currency: "INR",
        name: "OmniRide",
        description: `Ride from ${rideData.pickupLocation} to ${rideData.dropoffLocation}`,
        image: "https://placehold.co/100x100.png", // Your logo
        handler: async function (response: any) {
            // This function is called after a successful payment
            console.log("Payment successful:", response);
            
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
        },
        prefill: {
            name: `${userProfile.firstName} ${userProfile.lastName}`,
            email: user.email,
            contact: user.phoneNumber
        },
        notes: {
            address: "OmniRide Corporate Office"
        },
        theme: {
            color: "#6699FF"
        },
        modal: {
            ondismiss: function() {
                setIsLoading(false);
                toast({
                    title: "Payment Cancelled",
                    description: "Your ride request was not placed.",
                    variant: "destructive",
                })
            }
        }
    };
    
    try {
        const rzp = new window.Razorpay(options);
        rzp.open();
    } catch(e) {
        console.error("Razorpay Error: ", e);
        toast({
            title: "Payment Error",
            description: "Could not initialize payment gateway. Please try again.",
            variant: "destructive",
        })
        setIsLoading(false);
    }
  }
  
  const selectedVehicleData = vehicles.find(v => v.type === selectedVehicle);

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
                        <CardContent className="p-4 grid grid-cols-3 items-center gap-4">
                            <Image src={vehicle.image} alt={vehicle.type} width={100} height={60} className="rounded-md" data-ai-hint={vehicle.hint} />
                            <div className="col-span-2 flex justify-between items-center">
                                <div className="space-y-1">
                                    <h4 className="font-bold flex items-center gap-2">
                                        <vehicle.icon className="h-5 w-5" />
                                        {vehicle.type}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{vehicle.eta}</span>
                                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{vehicle.capacity} seats</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold flex items-center gap-1"><IndianRupee className="h-4 w-4" />{calculatePrice(vehicle.ratePerKm, vehicle.capacity).toFixed(2)}</p>
                                     <p className="text-xs text-muted-foreground text-right">Full ride</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
        {selectedVehicle && selectedVehicleData && (
            <Card className="p-4 space-y-4 animate-in fade-in-50">
                <div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div>
                            <Label htmlFor="seats">Seats</Label>
                            <Input 
                                id="seats"
                                type="number" 
                                min="1" 
                                max={selectedVehicleData.capacity} 
                                value={seats}
                                onChange={(e) => setSeats(Math.min(Number(e.target.value), selectedVehicleData.capacity))}
                                className="mt-1"
                            />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold"><IndianRupee className="inline h-5 w-5 -mt-1" />{calculatePrice(selectedVehicleData.ratePerKm, seats).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Estimated price</p>
                        </div>
                    </div>
                </div>

                <Separator />
                
                <div>
                    <h4 className="text-sm font-medium mb-2">Payment Method</h4>
                    <div className="flex gap-2">
                         <Button variant={paymentMethod === 'wallet' ? 'default' : 'outline'} className="flex-1" onClick={() => setPaymentMethod('wallet')}>
                            <Wallet className="mr-2 h-4 w-4" /> Wallet
                            {paymentMethod === 'wallet' && <CheckCircle2 className="ml-auto h-4 w-4" />}
                        </Button>
                        <Button variant={paymentMethod === 'upi' ? 'default' : 'outline'} className="flex-1" onClick={() => setPaymentMethod('upi')}>
                           <p className="font-bold mr-2">UPI</p>
                           {paymentMethod === 'upi' && <CheckCircle2 className="ml-auto h-4 w-4" />}
                        </Button>
                         <Button variant={paymentMethod === 'card' ? 'default' : 'outline'} className="flex-1" onClick={() => setPaymentMethod('card')}>
                            <CreditCard className="mr-2 h-4 w-4" /> Card
                             {paymentMethod === 'card' && <CheckCircle2 className="ml-auto h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                 <Button onClick={handleRequestRide} className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : `Pay & Request ${selectedVehicle}`}
                </Button>
            </Card>
        )}
    </div>
  );
}
