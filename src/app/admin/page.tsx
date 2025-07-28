
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Car, IndianRupee, BarChart, Loader2, Ban } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { format, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllUsers, getAllRides, updateUserStatus } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Ride {
  id: string;
  price: number;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
  userName: string;
  driverName: string;
  createdAt: string;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isBanned?: boolean;
    createdAt: string;
}


interface MetricCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
}

const MetricCard = ({ title, value, icon: Icon }: MetricCardProps) => (
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


export default function AdminPage() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [driverCount, setDriverCount] = useState<number | null>(null);
  const [rideCount, setRideCount] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allRides, setAllRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBanning, setIsBanning] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const usersSnapshot = await getDocs(query(collection(db, "users")));
        setUserCount(usersSnapshot.size);

        const driversSnapshot = await getDocs(query(collection(db, "drivers")));
        setDriverCount(driversSnapshot.size);

        const ridesSnapshot = await getDocs(query(collection(db, "rides")));
        const rides = ridesSnapshot.docs.map(doc => doc.data() as Ride);
        setRideCount(rides.length);

        const total = rides.reduce((sum, ride) => sum + (ride.price || 0), 0);
        setTotalRevenue(total);

        // Prepare data for the chart (revenue over the last 7 days)
        const dailyRevenue: { [key: string]: number } = {};
        for (let i = 0; i < 7; i++) {
            const date = subDays(new Date(), i);
            dailyRevenue[format(date, "MMM d")] = 0;
        }

        rides.forEach(ride => {
            if (ride.createdAt) {
                const rideDate = new Date(ride.createdAt);
                const dateKey = format(rideDate, "MMM d");
                if (dateKey in dailyRevenue) {
                    dailyRevenue[dateKey] += ride.price || 0;
                }
            }
        });
        
        const formattedChartData = Object.keys(dailyRevenue)
            .map(date => ({ date, total: dailyRevenue[date] }))
            .reverse();
        setChartData(formattedChartData);
        
        // Fetch detailed lists
        const usersResult = await getAllUsers();
        if (usersResult.success && usersResult.users) setAllUsers(usersResult.users as User[]);
        
        const ridesResult = await getAllRides();
        if (ridesResult.success && ridesResult.rides) setAllRides(ridesResult.rides as Ride[]);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleBanUser = async (user: User) => {
    setIsBanning(user.id);
    const result = await updateUserStatus(user.id, { isBanned: !user.isBanned });
    if(result.success) {
        toast({ title: `User ${user.isBanned ? 'unbanned' : 'banned'} successfully`});
        // Optimistically update UI
        setAllUsers(allUsers.map(u => u.id === user.id ? {...u, isBanned: !u.isBanned} : u));
    } else {
        toast({ title: "Action Failed", description: result.error, variant: "destructive"});
    }
    setIsBanning(null);
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'pending': return <Badge variant="secondary">Pending</Badge>;
        case 'accepted': return <Badge>Accepted</Badge>;
        case 'completed': return <Badge className="bg-green-600">Completed</Badge>;
        case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  }


  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="rides">Rides</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
           {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard title="Total Users" value={userCount?.toString() || '0'} icon={Users} />
                    <MetricCard title="Total Drivers" value={driverCount?.toString() || '0'} icon={Car} />
                    <MetricCard title="Total Rides" value={rideCount?.toString() || '0'} icon={BarChart} />
                    <MetricCard title="Total Revenue" value={`₹${totalRevenue?.toFixed(2) || '0.00'}`} icon={IndianRupee} />
                </div>
            )}

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Revenue - Last 7 Days</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-[350px] w-full" />
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <RechartsBarChart data={chartData}>
                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--background))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "var(--radius)",
                                    }}
                                />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="users" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all registered users.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-64 w-full" /> : (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allUsers.map(user => (
                                    <TableRow key={user.id} className={user.isBanned ? "bg-destructive/10" : ""}>
                                        <TableCell>
                                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                                            {user.isBanned && <Badge variant="destructive" className="mt-1">Banned</Badge>}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{isClient ? new Date(user.createdAt).toLocaleDateString() : ''}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant={user.isBanned ? 'secondary' : 'destructive'} size="sm" onClick={() => handleBanUser(user)} disabled={isBanning === user.id}>
                                                {isBanning === user.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Ban className="h-4 w-4" />}
                                                <span className="ml-2">{user.isBanned ? 'Unban' : 'Ban'}</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="rides" className="mt-6">
            <Card>
                 <CardHeader>
                    <CardTitle>Ride History</CardTitle>
                    <CardDescription>A log of all rides on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? <Skeleton className="h-64 w-full" /> : (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Passenger</TableHead>
                                    <TableHead>Driver</TableHead>
                                    <TableHead>Route</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allRides.map(ride => (
                                    <TableRow key={ride.id}>
                                        <TableCell>{ride.userName}</TableCell>
                                        <TableCell>{ride.driverName}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {ride.pickupLocation} to {ride.dropoffLocation}
                                        </TableCell>
                                        <TableCell>₹{ride.price?.toFixed(2)}</TableCell>
                                        <TableCell>{isClient ? new Date(ride.createdAt).toLocaleString() : ''}</TableCell>
                                        <TableCell>{getStatusBadge(ride.status)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                     )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
