
"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List, User, Car, MapPin, IndianRupee, Loader2, Users, Briefcase, History, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { acceptRide, getDriverRides } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useIsClient } from "@/hooks/useIsClient";

interface Driver {
  id: string;
  fullName: string;
}

interface Ride {
    id: string;
    pickupLocation: string;
    dropoffLocation: string;
    price: number;
    vehicleType: string;
    status: string;
    passengerCount: number;
    createdAt: string;
    userName?: string;
}

const MetricCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function DriverPage() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [rideHistory, setRideHistory] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingRide, setAcceptingRide] = useState<string | null>(null);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const isClient = useIsClient();

  useEffect(() => {
    // For simplicity, we'll treat the logged-in user as a driver if they have a profile.
    // A real app might have a separate "isDriver" flag.
    if (user && userProfile) {
      setDriver({ id: user.uid, fullName: `${userProfile.firstName} ${userProfile.lastName}` });
    }

    // Listen for new ride requests
    const ridesQuery = query(collection(db, "rides"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(ridesQuery, (querySnapshot) => {
        const ridesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ride));
        setAvailableRides(ridesList);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching rides: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userProfile]);

  useEffect(() => {
    async function fetchRideHistory() {
        if (driver) {
            const result = await getDriverRides(driver.id);
            if (result.success && result.rides) {
                setRideHistory(result.rides);
            }
        }
    }
    fetchRideHistory();
  }, [driver])
  
  const handleAcceptRide = async (rideId: string) => {
    if (!driver) {
        toast({
            title: "Not a registered driver",
            description: "You need to be registered as a driver to accept rides.",
            variant: "destructive"
        })
        return;
    }
    setAcceptingRide(rideId);
    const result = await acceptRide(rideId, driver.id);
    if(result.success){
        toast({
            title: "Ride Accepted!",
            description: "You are on your way to the pickup location."
        });
        // Optimistically move the ride from available to history
        const acceptedRide = availableRides.find(r => r.id === rideId);
        if (acceptedRide) {
            setAvailableRides(prev => prev.filter(r => r.id !== rideId));
            setRideHistory(prev => [{...acceptedRide, status: 'accepted'}, ...prev]);
        }
    } else {
        toast({
            title: "Failed to Accept",
            description: result.error,
            variant: "destructive"
        })
    }
    setAcceptingRide(null);
  }

  const totalEarnings = rideHistory.reduce((sum, ride) => sum + (ride.status === 'accepted' ? ride.price : 0), 0);
  const completedTrips = rideHistory.filter(ride => ride.status === 'accepted').length;

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Driver Dashboard</h1>
          <p className="text-muted-foreground">{driver ? `Welcome back, ${driver.fullName}` : 'Manage your rides and availability.'}</p>
        </div>
        <Button asChild>
          <Link href="/driver/register">Become a Driver</Link>
        </Button>
      </div>
      
      <Tabs defaultValue="available">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available Rides</TabsTrigger>
            <TabsTrigger value="history">My Trips</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>
        <TabsContent value="available" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Ride Requests
                  </div>
                </CardTitle>
                <CardDescription>
                  New ride requests will appear here. Refresh to see the latest.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                     <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                     </div>
                ) : availableRides.length > 0 ? (
                    <div className="space-y-4">
                        {availableRides.map(ride => (
                            <Card key={ride.id}>
                               <CardContent className="p-4 grid gap-4">
                                 <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg flex items-center gap-2"><Car className="h-5 w-5 text-primary" /> {ride.vehicleType}</p>
                                        <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                          <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {ride.passengerCount}</span>
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
        </TabsContent>
        <TabsContent value="history" className="mt-6">
             <Card>
                 <CardHeader>
                    <CardTitle>
                      <div className="flex items-center gap-2"><History className="h-5 w-5" />Trip History</div>
                    </CardTitle>
                    <CardDescription>A log of all your completed and ongoing trips.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    {!isClient || loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : rideHistory.length > 0 ? (
                        <div className="space-y-4">
                            {rideHistory.map(ride => (
                                <Card key={ride.id}>
                                    <CardContent className="p-4 grid gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-base flex items-center gap-2">
                                                    <Car className="h-5 w-5 text-primary" /> {ride.vehicleType}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                     {new Date(ride.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <p className="font-bold text-lg flex items-center gap-1">
                                                <IndianRupee className="h-5 w-5" />{ride.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <Separator />
                                         <div className="text-sm space-y-2">
                                            <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> <strong>Passenger:</strong> {ride.userName}</p>
                                            <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground"/> <strong>From:</strong> {ride.pickupLocation}</p>
                                            <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground"/> <strong>To:</strong> {ride.dropoffLocation}</p>
                                         </div>
                                        <div className="flex items-center justify-end text-sm text-muted-foreground">
                                            <span className={`capitalize font-semibold ${ride.status === 'accepted' ? 'text-green-600' : 'text-yellow-600'}`}>{ride.status}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>You haven't completed any trips yet.</p>
                        </div>
                    )}
                 </CardContent>
             </Card>
        </TabsContent>
        <TabsContent value="earnings" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
                <MetricCard title="Total Earnings" value={`₹${totalEarnings.toFixed(2)}`} icon={IndianRupee} />
                <MetricCard title="Completed Trips" value={completedTrips.toString()} icon={CheckCircle} />
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
