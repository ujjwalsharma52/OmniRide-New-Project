import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function DriverRegisterPage() {
  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Driver Registration</CardTitle>
          <CardDescription>Fill out the form below to start driving with OmniRide.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" placeholder="Max Robinson" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="license">Driving License Number</Label>
              <Input id="license" placeholder="AB12345678" required />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Vehicle Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vehicle-model">Vehicle Model</Label>
                <Input id="vehicle-model" placeholder="Toyota Camry" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vehicle-plate">License Plate Number</Label>
                <Input id="vehicle-plate" placeholder="OMNIRIDE" required />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full">Submit Application</Button>
          <p className="text-xs text-center text-muted-foreground">
            By submitting, you agree to our <Link href="#" className="underline">Terms of Service</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
