
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { 
  CarFront, 
  Bike, 
  Truck, 
  Clock, 
  IndianRupee, 
  Car, 
  Wallet, 
  CreditCard, 
  Star, 
  Loader2, 
  Users, 
  CheckCircle2, 
  Zap,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createRideRequest, authorizePayPalOrder } from "@/app/actions";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

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
    image: "https://picsum.photos/seed/car1/100/60",
    hint: "sedan car"
  },
  {
    type: "Moto",
    icon: Bike,
    eta: "3 min",
    ratePerKm: 8,
    capacity: 1,
    image: "https://picsum.photos/seed/moto1/100/60",
    hint: "motorcycle"
  },
  {
    type: "Auto",
    icon: Car,
    eta: "4 min",
    ratePerKm: 12,
    capacity: 3,
    image: "https://picsum.photos/seed/auto1/100/60",
    hint: "auto rickshaw"
  },
  {
    type: "SUV",
    icon: Car,
    eta: "7 min",
    ratePerKm: 20,
    capacity: 6,
    image: "https://picsum.photos/seed/suv1/100/60",
    hint: "suv car"
  },
  {
    type: "XL",
    icon: Truck,
    eta: "8 min",
    ratePerKm: 25,
    capacity: 7,
    image: "https://picsum.photos/seed/truck1/100/60",
    hint: "pickup truck"
  },
  {
    type: "Van",
    icon: Car,
    eta: "9 min",
    ratePerKm: 22,
    capacity: 8,
    image: "https://picsum.photos/seed/van1/100/60",
    hint: "van"
  },
  {
    type: "Luxury",
    icon: Star,
    eta: "6 min",
    ratePerKm: 35,
    capacity: 3,
    image: "https://picsum.photos/seed/luxury1/100/60",
    hint: "luxury car"
  },
];


export default function VehicleOptions({ pickup, dropoff, passengerCount, onRideRequested }: { pickup: string; dropoff: string; passengerCount: number; onRideRequested: (rideId: string) => void; }) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [seats, setSeats] = useState(passengerCount);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" is Razorpay (Fastest Digital)
  const [bookingType, setBookingType] = useState("seat"); // 'seat' or 'car'
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const distance = 12; // Standard distance for prototype calculation

  useEffect(() => {
    setSeats(passengerCount);
  }, [passengerCount]);

  const handleSelectVehicle = (vehicleType: string) => {
    setSelectedVehicle(vehicleType === selectedVehicle ? null : vehicleType);
    const vehicle = vehicles.find(v => v.type === vehicleType);
    if(vehicle) {
        setSeats(Math.min(passengerCount, vehicle.capacity));
    }
  };
  
  const calculatePrice = (vehicle: typeof vehicles[0] | undefined, numSeats: number, type: 'seat' | 'car') => {
      if (!distance || !vehicle) return 0;
      
      let price: number;
      if (type === 'car') {
          price = distance * vehicle.ratePerKm * 1.1; 
      } else {
          price = distance * (vehicle.ratePerKm / vehicle.capacity) * numSeats;
      }
      return Math.max(price, vehicle.ratePerKm * 0.5); 
  };

  const proceedWithRideRequest = async (rideData: any) => {
    const result = await createRideRequest(rideData);

    if (result.success && result.rideId) {
        toast({
            title: "Success!",
            description: "Ride booked successfully. Driver assigned.",
        });
        onRideRequested(result.rideId);
        setSelectedVehicle(null);
    } else {
        toast({
            title: "Booking Failed",
            description: result.error || "Please try again.",
            variant: "destructive",
        });
    }
    setIsLoading(false);
  };

  const handleRequestRide = async () => {
     if (!user || !userProfile) {
        toast({
            title: "Login Required",
            description: "Please log in to book a ride.",
            variant: "destructive",
        });
        router.push("/login");
        return;
    }

    if (!selectedVehicle) {
        toast({
            title: "Selection Required",
            description: "Please select a vehicle type.",
            variant: "destructive",
        });
        return;
    }

    if (!pickup || !dropoff) {
        toast({
            title: "Missing Locations",
            description: "Enter pickup and destination addresses.",
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
    
    const finalSeats = bookingType === 'car' ? vehicle.capacity : seats;
    const finalPrice = calculatePrice(vehicle, finalSeats, bookingType as 'seat' | 'car');

    const rideData = {
        userId: user.uid,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        vehicleType: vehicle.type,
        price: finalPrice,
        passengerCount: finalSeats,
        paymentMethod: paymentMethod,
    };
    
    if (paymentMethod === "cash") {
        await proceedWithRideRequest(rideData);
        return;
    }

    if (paymentMethod === "paypal") {
        const mockOrderId = "ORD-" + Math.random().toString(36).substr(2, 6).toUpperCase();
        const authResult = await authorizePayPalOrder(mockOrderId, finalPrice.toFixed(2));
        
        if (authResult.success) {
            await proceedWithRideRequest(rideData);
        } else {
            toast({ title: "Payment Failed", description: authResult.error, variant: "destructive" });
            setIsLoading(false);
        }
        return;
    }
    
    // Razorpay Integration (Fast Digital)
    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_key',
        amount: Math.round(rideData.price * 100),
        currency: "INR",
        name: "OmniRide FastPay",
        description: `Trip to ${rideData.dropoffLocation.split(',')[0]}`,
        image: "https://picsum.photos/seed/logo/100/100",
        handler: async function (response: any) {
            await proceedWithRideRequest(rideData);
        },
        prefill: {
            name: `${userProfile.firstName} ${userProfile.lastName}`,
            email: user.email,
        },
        theme: {
            color: "#6699FF"
        },
        modal: {
            ondismiss: function() {
                setIsLoading(false);
            }
        }
    };
    
    try {
        if (window.Razorpay) {
            const rzp = new window.Razorpay(options);
            rzp.open();
        } else {
            // Fallback for dev/missing script
            console.warn("Razorpay SDK not loaded, using fast mock...");
            await proceedWithRideRequest(rideData);
        }
    } catch(e) {
        setIsLoading(false);
        toast({
            title: "Payment Error",
            description: "Could not open payment gateway.",
            variant: "destructive",
        });
    }
  };
  
  const selectedVehicleData = vehicles.find(v => v.type === selectedVehicle);

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Select a Vehicle</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                <Zap className="h-3 w-3 fill-primary" /> Fastest Arrival: 3m
            </span>
        </div>

        <div className="grid gap-2">
            {vehicles.map((vehicle) => (
                <Card 
                    key={vehicle.type}
                    className={cn(
                        "transition-all duration-200 cursor-pointer border-2",
                        selectedVehicle === vehicle.type 
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg scale-[1.01]" 
                            : "hover:border-primary/40 border-transparent bg-card"
                    )}
                    onClick={() => handleSelectVehicle(vehicle.type)}
                >
                    <CardContent className="p-3 flex items-center gap-4">
                        <div className="relative h-14 w-20 flex-shrink-0">
                            <Image 
                                src={vehicle.image} 
                                alt={vehicle.type} 
                                fill
                                className="object-cover rounded-md" 
                                data-ai-hint={vehicle.hint} 
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-base flex items-center gap-1.5">
                                        <vehicle.icon className="h-4 w-4 text-primary" />
                                        {vehicle.type}
                                    </h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                        <Clock className="h-3 w-3" /> {vehicle.eta} • <Users className="h-3 w-3" /> {vehicle.capacity} seats
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-primary">₹{calculatePrice(vehicle, vehicle.capacity, 'car').toFixed(0)}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        {selectedVehicle && selectedVehicleData && (
            <Card className="p-5 space-y-5 animate-in slide-in-from-bottom-4 duration-300 border-primary/20">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold">Booking Mode</Label>
                        <span className="text-xs text-muted-foreground">Select how you want to ride</span>
                    </div>
                     <RadioGroup value={bookingType} onValueChange={setBookingType} className="grid grid-cols-2 gap-3">
                        <Label 
                            htmlFor="seat" 
                            className={cn(
                                "flex flex-col items-center justify-center rounded-xl border-2 p-3 cursor-pointer transition-all",
                                bookingType === 'seat' ? "border-primary bg-primary/5" : "border-muted hover:bg-muted/50"
                            )}
                        >
                            <RadioGroupItem value="seat" id="seat" className="sr-only" />
                            <span className="text-sm font-bold">Share Seat</span>
                            <span className="text-[10px] text-muted-foreground mt-1">Cost Effective</span>
                        </Label>
                        <Label 
                            htmlFor="car" 
                            className={cn(
                                "flex flex-col items-center justify-center rounded-xl border-2 p-3 cursor-pointer transition-all",
                                bookingType === 'car' ? "border-primary bg-primary/5" : "border-muted hover:bg-muted/50"
                            )}
                        >
                            <RadioGroupItem value="car" id="car" className="sr-only" />
                            <span className="text-sm font-bold">Full Vehicle</span>
                            <span className="text-[10px] text-muted-foreground mt-1">Private Trip</span>
                        </Label>
                      </RadioGroup>
                </div>

                {bookingType === 'seat' && (
                    <div className="flex items-center justify-between px-1">
                        <Label htmlFor="seats" className="font-bold">Number of Seats</Label>
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 rounded-full"
                                onClick={() => setSeats(Math.max(1, seats - 1))}
                            >-</Button>
                            <span className="text-lg font-bold w-4 text-center">{seats}</span>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 rounded-full"
                                onClick={() => setSeats(Math.min(selectedVehicleData.capacity, seats + 1))}
                            >+</Button>
                        </div>
                    </div>
                )}

                <Separator />
                
                <div className="space-y-3">
                    <Label className="text-sm font-bold">Fast Payment</Label>
                     <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-3">
                        <Label 
                            htmlFor="card" 
                            className={cn(
                                "flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all",
                                paymentMethod === 'card' ? "border-primary bg-primary/5" : "border-muted hover:bg-muted/50"
                            )}
                        >
                            <RadioGroupItem value="card" id="card" className="sr-only" />
                            <CreditCard className="h-5 w-5 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold">FastPay</span>
                                <span className="text-[9px] text-muted-foreground">UPI/Card</span>
                            </div>
                        </Label>
                        <Label 
                            htmlFor="cash" 
                            className={cn(
                                "flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all",
                                paymentMethod === 'cash' ? "border-primary bg-primary/5" : "border-muted hover:bg-muted/50"
                            )}
                        >
                            <RadioGroupItem value="cash" id="cash" className="sr-only" />
                            <IndianRupee className="h-5 w-5 text-green-600" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold">Cash</span>
                                <span className="text-[9px] text-muted-foreground">Pay Driver</span>
                            </div>
                        </Label>
                      </RadioGroup>
                </div>

                 <Button 
                    onClick={handleRequestRide} 
                    className="w-full h-12 text-lg font-bold group" 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin mr-2" />
                    ) : (
                        <>
                            {paymentMethod === 'cash' ? 'Quick Book' : 'Pay & Book'} 
                            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground font-medium bg-muted/30 p-2 rounded-lg">
                    <span>Est. Fare (Incl. Tolls)</span>
                    <span className="text-foreground font-bold text-sm">
                        ₹{calculatePrice(selectedVehicleData, bookingType === 'car' ? selectedVehicleData.capacity : seats, bookingType as 'seat'|'car').toFixed(0)}
                    </span>
                </div>
            </Card>
        )}
    </div>
  );
}
