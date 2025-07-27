
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List, User, Car, MapPin, IndianRupee, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { acceptRide } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface Driver {
  id: string;
  fullName: string;
  email: string;
  licenseNumber: string;
  vehicleModel: string;
  licensePlate: string;
}

interface Ride {
    id: string;
    pickupLocation: string;
    dropoffLocation: string;
    price: number;
    vehicleType: string;
    status: string;
    passengerCount: number;
}


export default function DriverPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRides, setLoadingRides] = useState(true);
  const [acceptingRide, setAcceptingRide] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDrivers() {
      try {
        const driversCollection = collection(db, "drivers");
        const driverSnapshot = await getDocs(driversCollection);
        const driversList = driverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));
        setDrivers(driversList);
      } catch (error) {
        console.error("Error fetching drivers: ", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDrivers();

    const ridesQuery = query(collection(db, "rides"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(ridesQuery, (querySnapshot) => {
        const ridesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ride));
        setRides(ridesList);
        setLoadingRides(false);
    }, (error) => {
        console.error("Error fetching rides: ", error);
        setLoadingRides(false);
    });

    return () => unsubscribe();
  }, []);
  
  const handleAcceptRide = async (rideId: string) => {
    if (drivers.length === 0) {
        toast({
            title: "No Drivers Available",
            description: "Cannot accept ride as there are no registered drivers.",
            variant: "destructive"
        })
        return;
    }
    setAcceptingRide(rideId);
    const driverId = drivers[0].id; // Assign the first driver for simplicity
    const result = await acceptRide(rideId, driverId);
    if(result.success){
        toast({
            title: "Ride Accepted!",
            description: "You are on your way to the pickup location."
        })
    } else {
        toast({
            title: "Failed to Accept",
            description: result.error,
            variant: "destructive"
        })
    }
    setAcceptingRide(null);
  }


  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Driver Dashboard</h1>
          <p className="text-muted-foreground">Manage your rides and availability.</p>
        </div>
        <Button asChild>
          <Link href="/driver/register">Become a Driver</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Ride Requests
            </CardTitle>
            <CardDescription>
              New ride requests will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRides ? (
                 <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                 </div>
            ) : rides.length > 0 ? (
                <div className="space-y-4">
                    {rides.map(ride => (
                        <Card key={ride.id}>
                           <CardContent className="p-4 grid gap-4">
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg flex items-center gap-2"><Car className="h-5 w-5 text-primary" /> {ride.vehicleType}</p>
                                    <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                      <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {ride.passengerCount}</span>
                                      <span>Status: {ride.status}</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-xl flex items-center gap-1"><IndianRupee className="h-5 w-5" />{ride.price.toFixed(2)}</p>
                                </div>
                             </div>
                             <div className="text-sm space-y-2 pt-2 border-t">
                                <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground"/> <strong>From:</strong> {ride.pickupLocation}</p>
                                <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground"/> <strong>To:</strong> {ride.dropoffLocation}</p>
                             </div>
                             <Button className="w-full" onClick={() => handleAcceptRide(ride.id)} disabled={acceptingRide === ride.id}>
                                 {acceptingRide === ride.id ? <Loader2 className="animate-spin" /> : "Accept Ride"}
                             </Button>
                           </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No active ride requests at the moment.</p>
                </div>
            )}
          </CardContent>
        </Card>
        
        <h2 className="text-2xl font-bold col-span-full mt-4">Our Drivers</h2>
        {loading ? (
           Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
           ))
        ) : (
          drivers.map(driver => (
            <Card key={driver.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> {driver.fullName}
                </CardTitle>
                <CardDescription>{driver.email}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="flex items-center gap-2"><Car className="h-4 w-4 text-muted-foreground"/> {driver.vehicleModel}</p>
                <p className="font-mono bg-muted p-1 rounded-md inline-block">{driver.licensePlate}</p>
              </CardContent>
            </Card>
          ))
        )}
         {!loading && drivers.length === 0 && (
            <p className="col-span-full text-muted-foreground text-center py-8">No drivers have registered yet.</p>
        )}
      </div>
    </div>
  );
}
