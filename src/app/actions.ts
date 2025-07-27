'use server';

import { suggestOptimalVehicle, type SuggestOptimalVehicleInput } from "@/ai/flows/suggest-optimal-vehicle";

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
