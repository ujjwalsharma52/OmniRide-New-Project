
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
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [bookingType, setBookingType] = useState("seat"); // 'seat' or 'car'
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const distance = 10; // Default distance in km

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
  
  const calculatePrice = (vehicle: typeof vehicles[0] | undefined, numSeats: number, type: 'seat' | 'car') => {
      if (!distance || !vehicle) return 0;
      
      let price: number;
      if (type === 'car') {
          price = distance * vehicle.ratePerKm * 1.1; 
      } else {
          price = distance * (vehicle.ratePerKm / vehicle.capacity) * numSeats;
      }
      return Math.max(price, vehicle.ratePerKm * 0.5); 
  }

  const proceedWithRideRequest = async (rideData: any) => {
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
        const mockOrderId = "ORDER-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const authResult = await authorizePayPalOrder(mockOrderId, finalPrice.toFixed(2));
        
        if (authResult.success) {
            toast({ title: "PayPal Authorized", description: "Payment processing successfully initiated." });
            await proceedWithRideRequest(rideData);
        } else {
            toast({ title: "PayPal Error", description: authResult.error, variant: "destructive" });
            setIsLoading(false);
        }
        return;
    }
    
    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(rideData.price * 100),
        currency: "INR",
        name: "OmniRide",
        description: `Ride from ${rideData.pickupLocation} to ${rideData.dropoffLocation}`,
        image: "https://placehold.co/100x100.png",
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
                                    <p className="font-bold flex items-center gap-1"><IndianRupee className="h-4 w-4" />{calculatePrice(vehicle, vehicle.capacity, 'car').toFixed(2)}</p>
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
                    <h4 className="text-sm font-medium mb-2">Booking Type</h4>
                     <RadioGroup value={bookingType} onValueChange={setBookingType} className="grid grid-cols-2 gap-4">
                        <div>
                          <RadioGroupItem value="seat" id="seat" className="peer sr-only" />
                          <Label htmlFor="seat" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            By Seat
                          </Label>
                        </div>
                         <div>
                          <RadioGroupItem value="car" id="car" className="peer sr-only" />
                          <Label htmlFor="car" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            Whole Car
                          </Label>
                        </div>
                      </RadioGroup>
                </div>

                <div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div>
                            {bookingType === 'seat' && (
                                <>
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
                                </>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold"><IndianRupee className="inline h-5 w-5 -mt-1" />{calculatePrice(selectedVehicleData, bookingType === 'car' ? selectedVehicleData.capacity : seats, bookingType as 'seat'|'car').toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Estimated price</p>
                        </div>
                    </div>
                </div>

                <Separator />
                
                <div>
                    <h4 className="text-sm font-medium mb-2">Payment Method</h4>
                     <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4">
                        <div>
                          <RadioGroupItem value="card" id="card" className="peer sr-only" />
                          <Label htmlFor="card" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <CreditCard className="mb-3 h-6 w-6" />
                            Card
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />
                          <Label htmlFor="paypal" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                             <div className="flex items-center gap-2 mb-3">
                                <Image src="https://www.vectorlogo.zone/logos/paypal/paypal-icon.svg" alt="PayPal" width={24} height={24} />
                            </div>
                            PayPal
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                          <Label htmlFor="upi" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                             <div className="flex items-center gap-2 mb-3">
                                <Image src="https://www.vectorlogo.zone/logos/googlepay/googlepay-icon.svg" alt="Google Pay" width={24} height={24} />
                                <Image src="https://www.vectorlogo.zone/logos/paytm/paytm-icon.svg" alt="Paytm" width={24} height={24} />
                            </div>
                            UPI
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                          <Label htmlFor="cash" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <IndianRupee className="mb-3 h-6 w-6" />
                            Cash
                          </Label>
                        </div>
                      </RadioGroup>
                </div>

                 <Button onClick={handleRequestRide} className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : `Confirm & Request ${selectedVehicle}`}
                </Button>
            </Card>
        )}
    </div>
  );
}
