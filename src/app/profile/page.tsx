import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, History } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="container py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="person" />
                <AvatarFallback>OR</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <CardTitle className="text-3xl">Omni Rider</CardTitle>
                <CardDescription>Member since Jan 2024</CardDescription>
            </div>
            <Button>Edit Profile</Button>
        </CardHeader>
        <CardContent>
            <Separator className="my-4" />
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="flex items-center gap-4 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>rider@omniride.com</span>
                </div>
                 <div className="flex items-center gap-4 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+1 (234) 567-890</span>
                </div>
            </div>
            <Separator className="my-6" />
             <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><History className="h-5 w-5"/> Ride History</h3>
                <div className="text-sm text-muted-foreground">
                    Your past rides will appear here.
                </div>
                {/* Placeholder for ride history list */}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
