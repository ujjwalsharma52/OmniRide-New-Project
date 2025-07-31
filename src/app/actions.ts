
'use server';

import { suggestOptimalVehicle } from "@/ai/flows/suggest-optimal-vehicle";
import { analyzeFeedback } from "@/ai/flows/analyze-feedback";
import type { SuggestOptimalVehicleInput, AnalyzeFeedbackInput } from "@/ai/schemas";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, serverTimestamp, updateDoc, getDocs, query, where, orderBy, getDoc } from "firebase/firestore";

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
                // Convert Firestore Timestamp to a serializable format (ISO string)
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
        const ridesQuery = query(
            collection(db, "rides"),
            where("driverId", "==", driverId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(ridesQuery);
        const rides = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            let userName = 'Unknown User';
            if (data.userId) {
                const userRef = doc(db, "users", data.userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    userName = `${userData.firstName} ${userData.lastName}`;
                }
            }
            return {
                id: doc.id,
                ...data,
                userName,
                createdAt: data.createdAt?.toDate().toISOString(),
                acceptedAt: data.acceptedAt?.toDate().toISOString(),
            };
        }));
        return { success: true, rides };
    } catch (error) {
        console.error("Error fetching driver rides:", error);
        return { success: false, error: "Failed to fetch driver rides." };
    }
}

// --- Admin Actions ---

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
        const ridesSnapshot = await getDocs(query(collection(db, "rides"), orderBy("createdAt", "desc")));
        const rides = await Promise.all(ridesSnapshot.docs.map(async (d) => {
            const data = d.data();
            let userName = 'N/A';
            let driverName = 'N/A';

            if (data.userId) {
                const userSnap = await getDoc(doc(db, "users", data.userId));
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    userName = `${userData.firstName} ${userData.lastName}`;
                }
            }
            if (data.driverId) {
                const driverSnap = await getDoc(doc(db, "drivers", data.driverId));
                 if (driverSnap.exists()) {
                    driverName = driverSnap.data().fullName;
                }
            }

            return {
                id: d.id,
                ...data,
                userName,
                driverName,
                createdAt: data.createdAt?.toDate().toISOString(),
            };
        }));
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
        // In a real app, you would also disable the user in Firebase Auth
        // using the Admin SDK.
        return { success: true };
    } catch (error) {
        console.error("Error updating user status:", error);
        return { success: false, error: "Failed to update user status." };
    }
}

    

    