
"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, DocumentData, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List, User, Car, MapPin, IndianRupee, Loader2, Users, History, CheckCircle, KeyRound, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { acceptRide, getDriverRides, startRide } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useIsClient } from "@/hooks/useIsClient";
import { Input } from "@/components/ui/input";

interface Driver {
  id: string;
  fullName: string;
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
    createdAt: string;
    acceptedAt?: string;
    userId: string;
    userName?: string;
    driverId?: string;
}

interface UserMap {
    [key: string]: string;
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
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingRide, setAcceptingRide] = useState<string | null>(null);
  const [startingRide, setStartingRide] = useState<string | null>(null);
  const [otp, setOtp] = useState<{[key: string]: string}>({});
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const isClient = useIsClient();
  const [rideHistory, setRideHistory] = useState<Ride[]>([]);
  const [usersMap, setUsersMap] = useState<UserMap>({});

  useEffect(() => {
    async function fetchDriverProfile(userId: string) {
      const driverDocRef = doc(db, "drivers", userId);
      const driverSnap = await getDoc(driverDocRef);
      if (driverSnap.exists()) {
        setDriver({ id: driverSnap.id, ...driverSnap.data() } as Driver);
      } else {
        setDriver(null); // Not a registered driver
      }
    }

    async function fetchInitialData() {
        if (user) {
            setLoading(true);
            await fetchDriverProfile(user.uid);
            
            // Pre-fetch all users to build a map for quick lookup
            const usersSnapshot = await getDocs(collection(db, "users"));
            const uMap: UserMap = {};
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                uMap[doc.id] = `${data.firstName} ${data.lastName}`;
            });
            setUsersMap(uMap);

            await fetchRideHistory(user.uid);
            
            // Setup real-time listeners for rides
            const ridesQuery = query(collection(db, "rides"), where("status", "in", ["pending", "accepted", "ongoing"]));
            const unsubscribe = onSnapshot(ridesQuery, (querySnapshot) => {
                const allRides: Ride[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ride));
                
                // Filter rides on the client
                const pending = allRides.filter(ride => ride.status === 'pending');
                const acceptedByMe = allRides.filter(ride => ride.driverId === user.uid && (ride.status === 'accepted' || ride.status === 'ongoing'));
                
                setAvailableRides(pending);
                setMyRides(acceptedByMe);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching rides: ", error);
                setLoading(false);
            });

            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }

    if(user) {
      fetchInitialData();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchRideHistory(driverId: string) {
      const result = await getDriverRides(driverId);
      if (result.success && result.rides) {
        setRideHistory(result.rides as Ride[]);
      }
  }
  
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
    } else {
        toast({
            title: "Failed to Accept",
            description: result.error,
            variant: "destructive"
        })
    }
    setAcceptingRide(null);
  }

  const handleStartRide = async (rideId: string) => {
    if (!otp[rideId] || otp[rideId].length !== 4) {
        toast({ title: "Invalid OTP", description: "Please enter the 4-digit OTP from the rider.", variant: "destructive" });
        return;
    }
    setStartingRide(rideId);
    const result = await startRide(rideId, otp[rideId]);
    if (result.success) {
        toast({ title: "Ride Started!", description: "Have a safe trip." });
    } else {
        toast({ title: "Failed to Start Ride", description: result.error, variant: "destructive" });
    }
    setStartingRide(null);
  }

  const handleOtpChange = (rideId: string, value: string) => {
    setOtp(prev => ({ ...prev, [rideId]: value }));
  }

  const totalEarnings = rideHistory.reduce((sum, ride) => sum + (ride.status === 'completed' ? ride.price : 0), 0);
  const completedTrips = rideHistory.filter(ride => ride.status === 'completed').length;
  const ongoingRide = myRides.find(ride => ride.status === 'ongoing');
  const acceptedButNotStartedRides = myRides.filter(ride => ride.status === 'accepted');


  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Driver Dashboard</h1>
          <p className="text-muted-foreground">{driver ? `Welcome back, ${driver.fullName}` : 'Manage your rides and availability.'}</p>
        </div>
        {!driver && isClient && (
            <Button asChild>
                <Link href="/driver/register">Become a Driver</Link>
            </Button>
        )}
      </div>

       {ongoingRide && (
        <Card className="mb-6 bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2"><Car className="animate-pulse" /> Ongoing Ride</CardTitle>
                <CardDescription>You are currently on a trip. Drive safely!</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-sm space-y-2">
                    <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> <strong>Passenger:</strong> {usersMap[ongoingRide.userId] || 'Loading...'}</p>
                    <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground"/> <strong>To:</strong> {ongoingRide.dropoffLocation}</p>
                </div>
                 <div className="flex justify-between items-center mt-4">
                    <p className="font-bold text-lg flex items-center gap-1">
                        <IndianRupee className="h-5 w-5" />{ongoingRide.price.toFixed(2)}
                    </p>
                    <Button variant="destructive" size="sm"><AlertTriangle className="h-4 w-4 mr-2" />SOS</Button>
                </div>
            </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="available">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available Rides ({availableRides.length})</TabsTrigger>
            <TabsTrigger value="history">My Trips ({acceptedButNotStartedRides.length})</TabsTrigger>
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
                  New ride requests will appear here automatically.
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
                        <p>No new ride requests at the moment.</p>
                    </div>
                )}
              </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
             <Card>
                 <CardHeader>
                    <CardTitle>
                      <div className="flex items-center gap-2"><History className="h-5 w-5" />My Accepted Trips</div>
                    </CardTitle>
                    <CardDescription>A log of all your completed and ongoing trips.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    {!isClient || loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : acceptedButNotStartedRides.length > 0 ? (
                        <div className="space-y-4">
                            {acceptedButNotStartedRides.map(ride => (
                                <Card key={ride.id}>
                                    <CardContent className="p-4 grid gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-base flex items-center gap-2">
                                                    <Car className="h-5 w-5 text-primary" /> {ride.vehicleType}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                     Accepted on {isClient && ride.acceptedAt ? new Date(ride.acceptedAt).toLocaleString() : ''}
                                                </p>
                                            </div>
                                            <p className="font-bold text-lg flex items-center gap-1">
                                                <IndianRupee className="h-5 w-5" />{ride.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <Separator />
                                         <div className="text-sm space-y-2">
                                            <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> <strong>Passenger:</strong> {usersMap[ride.userId] || 'Loading...'}</p>
                                            <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground"/> <strong>From:</strong> {ride.pickupLocation}</p>
                                         </div>
                                         <Separator />
                                         <div className="space-y-2">
                                            <label htmlFor={`otp-${ride.id}`} className="text-sm font-medium flex items-center gap-2"><KeyRound className="h-4 w-4" /> Rider's OTP</label>
                                            <div className="flex gap-2">
                                                <Input 
                                                    id={`otp-${ride.id}`} 
                                                    placeholder="Enter 4-digit OTP" 
                                                    maxLength={4}
                                                    value={otp[ride.id] || ''}
                                                    onChange={(e) => handleOtpChange(ride.id, e.target.value)}
                                                />
                                                <Button onClick={() => handleStartRide(ride.id)} disabled={startingRide === ride.id}>
                                                    {startingRide === ride.id ? <Loader2 className="animate-spin" /> : "Start Ride"}
                                                </Button>
                                            </div>
                                         </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>You haven't accepted any trips yet.</p>
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
