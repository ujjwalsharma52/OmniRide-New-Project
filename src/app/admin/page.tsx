
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, IndianRupee, BarChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { format, subDays } from "date-fns";

interface Ride {
  price: number;
  createdAt: {
    seconds: number;
  };
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
  const [isLoading, setIsLoading] = useState(true);

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
        const sevenDaysAgo = subDays(new Date(), 6);
        for (let i = 0; i < 7; i++) {
            const date = subDays(new Date(), i);
            dailyRevenue[format(date, "MMM d")] = 0;
        }

        rides.forEach(ride => {
            if (ride.createdAt) {
                const rideDate = new Date(ride.createdAt.seconds * 1000);
                if (rideDate >= sevenDaysAgo) {
                    const dateKey = format(rideDate, "MMM d");
                    if (dateKey in dailyRevenue) {
                        dailyRevenue[dateKey] += ride.price || 0;
                    }
                }
            }
        });
        
        const formattedChartData = Object.keys(dailyRevenue)
            .map(date => ({ date, total: dailyRevenue[date] }))
            .reverse();
        
        setChartData(formattedChartData);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);


  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
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
    </div>
  );
}
