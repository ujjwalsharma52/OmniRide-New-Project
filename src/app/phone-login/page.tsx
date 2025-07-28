
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Loader2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { Label } from "@/components/ui/label";

// Helper function to setup reCAPTCHA
const setupRecaptcha = (phoneNumber: string) => {
    if (!auth) return;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("reCAPTCHA solved");
      }
    });
}

export default function PhoneLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState<string | undefined>("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSendOtp = async () => {
    if (!phone) {
        toast({ title: "Phone number is required", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    try {
        setupRecaptcha(phone);
        const appVerifier = window.recaptchaVerifier;
        const result = await signInWithPhoneNumber(auth, phone, appVerifier);
        setConfirmationResult(result);
        toast({ title: "OTP Sent!", description: "Check your phone for the verification code."});
    } catch (error: any) {
        console.error("OTP Error", error);
        toast({ title: "Failed to send OTP", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) {
        toast({ title: "OTP is required", variant: "destructive"});
        return;
    }
    if (!confirmationResult) {
        toast({ title: "Please request an OTP first", variant: "destructive"});
        return;
    }

    setIsLoading(true);
    try {
        await confirmationResult.confirm(otp);
        // OTP is verified. Now you need to check if user exists in your DB
        // and either log them in or redirect to a signup page.
        // For now, just redirecting to profile.
        toast({ title: "Logged In!", description: "Welcome to OmniRide."});
        router.push("/profile");
    } catch (error: any) {
        toast({ title: "Invalid OTP", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Log In with Phone</CardTitle>
          <CardDescription>
            {confirmationResult ? "Enter the OTP we sent you." : "Enter your phone number to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            {!confirmationResult ? (
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                     <PhoneInput
                        id="phone"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={setPhone}
                        defaultCountry="IN"
                        className="input" // Basic styling, can be improved in globals.css
                     />
                </div>
            ) : (
                 <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                    />
                 </div>
            )}
            <div id="recaptcha-container"></div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            {!confirmationResult ? (
                 <Button onClick={handleSendOtp} className="w-full" disabled={isLoading || !phone}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send OTP"}
                 </Button>
            ) : (
                <Button onClick={handleVerifyOtp} className="w-full" disabled={isLoading || !otp}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify OTP & Log In"}
                 </Button>
            )}
             <div className="text-center text-sm">
                Or log in with {" "}
                <Link href="/login" className="underline">
                Email
                </Link>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
