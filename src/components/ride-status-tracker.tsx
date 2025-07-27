
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Car, Clock, User, Shield, Star, MapPin } from "lucide-react";
import { Button } from "./ui/button";

interface Ride {
    id: string;
    pickupLocation: string;
    dropoffLocation: string;
    status: string;
    driverId?: string;
}

interface Driver {
    id: string;
    fullName: string;
    vehicleModel: string;
    licensePlate: string;
}

export default function RideStatusTracker({ rideId, onRideComplete }: { rideId: string; onRideComplete: () => void; }) {
    const [ride, setRide] = useState<Ride | null>(null);
    const [driver, setDriver] = useState<Driver | null>(null);
    const [loading, setLoading] = useState(true);
    const [eta] = useState(Math.floor(Math.random() * 5) + 2); // Random ETA between 2-7 mins

    useEffect(() => {
        const rideRef = doc(db, "rides", rideId);
        const unsubscribe = onSnapshot(rideRef, async (docSnap) => {
            if (docSnap.exists()) {
                const rideData = { id: docSnap.id, ...docSnap.data() } as Ride;
                setRide(rideData);

                if (rideData.driverId) {
                    const driverRef = doc(db, "drivers", rideData.driverId);
                    const driverSnap = await getDoc(driverRef);
                    if (driverSnap.exists()) {
                        setDriver({ id: driverSnap.id, ...driverSnap.data() } as Driver);
                    }
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [rideId]);

    if (loading) {
        return (
             <Card className="w-full max-w-lg">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                   <Skeleton className="h-24 w-full" />
                   <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    if (!ride) {
        return (
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Ride Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>We couldn't find the details for this ride.</p>
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card className="w-full max-w-lg animate-in fade-in-50">
            <CardHeader>
                {ride.status === 'pending' && (
                    <>
                        <CardTitle>Finding your ride...</CardTitle>
                        <CardDescription>We're searching for a nearby driver. Please wait.</CardDescription>
                    </>
                )}
                 {ride.status === 'accepted' && driver && (
                    <>
                        <CardTitle>Your driver is on the way!</CardTitle>
                        <CardDescription>Get ready to meet your driver at the pickup location.</CardDescription>
                    </>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/50 border">
                     <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <strong>From:</strong> {ride.pickupLocation}
                    </div>
                     <div className="flex items-center gap-2 text-sm mt-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <strong>To:</strong> {ride.dropoffLocation}
                    </div>
                </div>

                {ride.status === 'pending' && (
                    <div className="text-center py-8">
                         <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-primary/50 rounded-full animate-ping"></div>
                            <Car className="w-12 h-12 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                        </div>
                        <p className="mt-4 text-muted-foreground">Searching for drivers...</p>
                    </div>
                )}
                
                {ride.status === 'accepted' && driver && (
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold">{driver.fullName}</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> 4.9
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{eta} min</p>
                                <p className="text-xs text-muted-foreground">ETA</p>
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg space-y-2">
                            <h4 className="font-semibold text-sm">Vehicle Details</h4>
                            <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-muted-foreground" />
                                <p>{driver.vehicleModel}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <p className="font-mono bg-muted px-2 py-1 rounded-md text-sm">{driver.licensePlate}</p>
                            </div>
                        </div>
                    </div>
                )}

            </CardContent>
             <CardFooter className="flex-col gap-2">
                <Button variant="outline" className="w-full">Cancel Ride</Button>
                {ride.status === 'accepted' && (
                     <Button className="w-full" onClick={onRideComplete}>Mark as Complete</Button>
                )}
            </CardFooter>
        </Card>
    )
}
