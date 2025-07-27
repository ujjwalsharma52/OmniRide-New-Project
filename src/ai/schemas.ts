/**
 * @fileOverview Defines the Zod schemas and TypeScript types for the AI flows.
 * This file does not contain 'use server' and can be safely imported on the client.
 */

import { z } from 'zod';

// --- SuggestOptimalVehicle Schemas ---
export const SuggestOptimalVehicleInputSchema = z.object({
  passengerCount: z
    .number()
    .describe('The number of passengers for the ride.'),
  cargoVolume: z
    .string()
    .describe('The estimated cargo volume for the ride (e.g., small, medium, large).'),
  trafficConditions: z
    .string()
    .describe('The current traffic conditions (e.g., light, moderate, heavy).'),
});
export type SuggestOptimalVehicleInput = z.infer<typeof SuggestOptimalVehicleInputSchema>;

export const SuggestOptimalVehicleOutputSchema = z.object({
  vehicleSuggestion: z
    .string()
    .describe('The suggested vehicle type (e.g., car, motorcycle, truck).'),
  reasoning: z
    .string()
    .describe('The reasoning behind the vehicle suggestion.'),
});
export type SuggestOptimalVehicleOutput = z.infer<typeof SuggestOptimalVehicleOutputSchema>;


// --- AnalyzeFeedback Schemas ---
export const AnalyzeFeedbackInputSchema = z.object({
  rating: z.number().min(1).max(5).describe("The star rating given by the user (1-5)."),
  feedback: z.string().describe("The textual feedback provided by the user."),
});
export type AnalyzeFeedbackInput = z.infer<typeof AnalyzeFeedbackInputSchema>;

const FeedbackSentimentSchema = z.enum(["positive", "negative", "neutral"]);

const FeedbackCategorySchema = z.enum([
    "Driver",
    "Vehicle",
    "Route",
    "Pricing",
    "App Experience",
    "General",
]);

export const AnalyzeFeedbackOutputSchema = z.object({
  sentiment: FeedbackSentimentSchema.describe("The overall sentiment of the feedback."),
  category: FeedbackCategorySchema.describe("The primary category of the feedback."),
});
export type AnalyzeFeedbackOutput = z.infer<typeof AnalyzeFeedbackOutputSchema>;
