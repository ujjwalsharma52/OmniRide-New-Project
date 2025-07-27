'use server';

import { suggestOptimalVehicle, type SuggestOptimalVehicleInput } from "@/ai/flows/suggest-optimal-vehicle";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";

export async function getVehicleSuggestion(input: SuggestOptimalVehicleInput) {
  try {
    const result = await suggestOptimalVehicle(input);
    return result;
  } catch (error) {
    console.error("Error in getVehicleSuggestion action:", error);
    // In a real app, you would have more robust error handling and logging
    throw new Error("Failed to communicate with the AI service.");
  }
}


export async function createRideRequest(rideData: {
  userId: string;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
  price: number;
  passengerCount: number;
}) {
  try {
    const docRef = await addDoc(collection(db, "rides"), {
      ...rideData,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return { success: true, rideId: docRef.id };
  } catch (error) {
    console.error("Error creating ride request:", error);
    return { success: false, error: "Failed to create ride request." };
  }
}

export async function acceptRide(rideId: string, driverId: string) {
    try {
        const rideRef = doc(db, "rides", rideId);
        await updateDoc(rideRef, {
            status: "accepted",
            driverId: driverId,
            acceptedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Error accepting ride:", error);
        return { success: false, error: "Failed to accept ride." };
    }
}
