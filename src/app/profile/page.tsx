"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, History, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: any;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      if (user) {
        setIsFetchingProfile(true);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          console.log("No such document!");
        }
        setIsFetchingProfile(false);
      }
    }

    if (!loading) {
      fetchUserProfile();
    }
  }, [user, loading]);

  const getInitials = () => {
    if (userProfile) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`;
    }
    return "OR";
  };
  
  if (loading || isFetchingProfile) {
    return (
        <div className="container py-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!user) {
     return (
        <div className="container py-8 text-center">
            <p>Please log in to view your profile.</p>
        </div>
     )
  }

  return (
    <div className="container py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${userProfile?.firstName} ${userProfile?.lastName}`} alt="User" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl">
              {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Omni Rider"}
            </CardTitle>
            <CardDescription>
                {userProfile ? `Member since ${new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString()}` : 'Loading...'}
            </CardDescription>
          </div>
          <Button>Edit Profile</Button>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="flex items-center gap-4 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{userProfile?.email}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>(Phone number not provided)</span>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5" /> Ride History
            </h3>
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