import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";
import Link from "next/link";

export default function DriverPage() {
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

      <Card>
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
          <div className="text-center py-12 text-muted-foreground">
            <p>No active ride requests at the moment.</p>
          </div>
          {/* In a real app, a list of ride request cards would be rendered here */}
        </CardContent>
      </Card>
    </div>
  );
}
