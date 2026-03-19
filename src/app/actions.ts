
'use server';

import { suggestOptimalVehicle } from "@/ai/flows/suggest-optimal-vehicle";
import { analyzeFeedback } from "@/ai/flows/analyze-feedback";
import type { SuggestOptimalVehicleInput, AnalyzeFeedbackInput } from "@/ai/schemas";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, serverTimestamp, updateDoc, getDocs, query, where, orderBy, getDoc } from "firebase/firestore";

/**
 * Suggests a vehicle based on user input.
 * Includes a robust fallback if the Genkit AI service fails (e.g., missing API keys).
 */
export async function getVehicleSuggestion(input: SuggestOptimalVehicleInput) {
  try {
    const result = await suggestOptimalVehicle(input);
    return result;
  } catch (error) {
    console.warn("AI suggestion service unavailable, using heuristic fallback.", error);
    
    // Heuristic Fallback Logic
    let vehicle = 'Standard';
    let reasoning = "A standard sedan is our most versatile option for your trip.";

    if (input.passengerCount === 1 && input.cargoVolume === 'small') {
      vehicle = 'Moto';
      reasoning = "A motorcycle is the quickest way for a solo traveler with minimal luggage.";
    } else if (input.passengerCount > 6) {
      vehicle = 'XL';
      reasoning = "For large groups, an XL vehicle ensures everyone can travel together comfortably.";
    } else if (input.passengerCount > 4 || input.cargoVolume === 'large') {
      vehicle = 'SUV';
      reasoning = "An SUV provides the extra space needed for your passengers or cargo.";
    } else if (input.passengerCount <= 3 && input.trafficConditions === 'heavy') {
      vehicle = 'Auto';
      reasoning = "An auto-rickshaw is ideal for navigating through heavy city traffic.";
    }

    return { 
      vehicleSuggestion: vehicle, 
      reasoning: `${reasoning} (Note: System suggestion while AI is offline.)` 
    };
  }
}

/**
 * Fetches location suggestions using the RapidAPI Google Maps Places proxy.
 */
export async function getPlaceSuggestions(input: string) {
  if (!input || input.length < 2) return { success: true, suggestions: [] };

  const url = 'https://google-map-places-new-v2.p.rapidapi.com/v1/places:autocomplete';
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
      'x-rapidapi-host': 'google-map-places-new-v2.p.rapidapi.com',
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': '*'
    },
    body: JSON.stringify({
      input: input,
      includeQueryPredictions: true,
    })
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    
    const suggestions = result.suggestions?.map((s: any) => ({
      description: s.placePrediction?.text?.text || s.queryPrediction?.text?.text || "Unknown location",
      placeId: s.placePrediction?.placeId || null
    })) || [];

    return { success: true, suggestions };
  } catch (error) {
    console.error("RapidAPI Error:", error);
    return { success: false, error: "Failed to fetch location suggestions" };
  }
}

export async function submitRating(input: AnalyzeFeedbackInput, rideId: string, userId: string) {
    try {
        const analysis = await analyzeFeedback(input);
        
        await addDoc(collection(db, "ratings"), {
            rideId,
            userId,
            rating: input.rating,
            feedback: input.feedback,
            ...analysis,
            createdAt: serverTimestamp(),
        });
        
        return { success: true };
    } catch (error) {
        console.error("Error submitting rating:", error);
        return { success: false, error: "Failed to submit rating." };
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
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
        await updateDoc(rideRef, {
            status: "accepted",
            driverId: driverId,
            acceptedAt: serverTimestamp(),
            otp: otp
        });
        return { success: true };
    } catch (error) {
        console.error("Error accepting ride:", error);
        return { success: false, error: "Failed to accept ride." };
    }
}

export async function startRide(rideId: string, otp: string) {
    try {
        const rideRef = doc(db, "rides", rideId);
        const rideSnap = await getDoc(rideRef);

        if (!rideSnap.exists()) {
            return { success: false, error: "Ride not found." };
        }

        const rideData = rideSnap.data();
        if (rideData.otp !== otp) {
            return { success: false, error: "Invalid OTP." };
        }

        await updateDoc(rideRef, {
            status: "ongoing",
            startedAt: serverTimestamp()
        });
        return { success: true };

    } catch (error) {
        console.error("Error starting ride:", error);
        return { success: false, error: "Failed to start ride." };
    }
}


export async function getRideHistory(userId: string) {
    try {
        const ridesQuery = query(
            collection(db, "rides"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(ridesQuery);
        const rides = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toISOString(),
            }
        });
        return { success: true, rides };
    } catch (error) {
        console.error("Error fetching ride history:", error);
        return { success: false, error: "Failed to fetch ride history." };
    }
}

export async function getDriverRides(driverId: string) {
    try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data()]));

        const ridesQuery = query(
            collection(db, "rides"),
            where("driverId", "==", driverId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(ridesQuery);
        const rides = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const user = usersMap.get(data.userId);
            const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
            
            return {
                id: doc.id,
                ...data,
                userName,
                createdAt: data.createdAt?.toDate().toISOString(),
                acceptedAt: data.acceptedAt?.toDate().toISOString(),
            };
        });
        return { success: true, rides };
    } catch (error) {
        console.error("Error fetching driver rides:", error);
        return { success: false, error: "Failed to fetch driver rides." };
    }
}

export async function getAllUsers() {
    try {
        const usersSnapshot = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
        const users = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toISOString(),
            }
        });
        return { success: true, users };
    } catch (error) {
        console.error("Error fetching all users:", error);
        return { success: false, error: "Failed to fetch users." };
    }
}

export async function getAllRides() {
    try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data()]));

        const driversSnapshot = await getDocs(collection(db, "drivers"));
        const driversMap = new Map(driversSnapshot.docs.map(doc => [doc.id, doc.data()]));

        const ridesSnapshot = await getDocs(query(collection(db, "rides"), orderBy("createdAt", "desc")));
        
        const rides = ridesSnapshot.docs.map(d => {
            const data = d.data();
            let userName = 'N/A';
            let driverName = 'N/A';

            if (data.userId && usersMap.has(data.userId)) {
                const userData = usersMap.get(data.userId);
                userName = `${userData.firstName} ${userData.lastName}`;
            }
            if (data.driverId && driversMap.has(data.driverId)) {
                driverName = driversMap.get(data.driverId).fullName;
            }

            return {
                id: d.id,
                ...data,
                userName,
                driverName,
                createdAt: data.createdAt?.toDate().toISOString(),
            };
        });
        return { success: true, rides };
    } catch (error) {
        console.error("Error fetching all rides:", error);
        return { success: false, error: "Failed to fetch rides." };
    }
}


export async function updateUserStatus(userId: string, status: { isBanned: boolean }) {
     try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            isBanned: status.isBanned
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating user status:", error);
        return { success: false, error: "Failed to update user status." };
    }
}
