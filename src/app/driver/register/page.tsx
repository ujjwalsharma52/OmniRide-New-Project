
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  licenseNumber: z.string().min(1, "License number is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  licensePlate: z.string().min(1, "License plate is required"),
});

type FormValues = z.infer<typeof formSchema>;


export default function DriverRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      licenseNumber: "",
      vehicleModel: "",
      licensePlate: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    try {
      // Save driver data to Firestore
      await addDoc(collection(db, "drivers"), {
        ...data,
        createdAt: new Date(),
      });

      toast({
        title: "Application Submitted!",
        description: "Thank you for registering. We will review your application.",
      });

      // Redirect to driver dashboard
      router.push("/driver");
    } catch (error: any) {
      console.error("Driver registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Driver Registration</CardTitle>
          <CardDescription>Fill out the form below to start driving with OmniRide.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                   <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Max Robinson" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="m@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driving License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="AB12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Vehicle Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="vehicleModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Model</FormLabel>
                            <FormControl>
                              <Input placeholder="Toyota Camry" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="licensePlate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Plate Number</FormLabel>
                            <FormControl>
                              <Input placeholder="OMNIRIDE" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Application
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By submitting, you agree to our <Link href="#" className="underline">Terms of Service</Link>.
              </p>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}

