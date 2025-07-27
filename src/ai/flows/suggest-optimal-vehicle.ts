'use server';

/**
 * @fileOverview Vehicle suggestion AI agent.
 *
 * - suggestOptimalVehicle - A function that suggests the optimal vehicle based on the number of passengers, cargo volume, and traffic conditions.
 * - SuggestOptimalVehicleInput - The input type for the suggestOptimalVehicle function.
 * - SuggestOptimalVehicleOutput - The return type for the suggestOptimalVehicle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalVehicleInputSchema = z.object({
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

const SuggestOptimalVehicleOutputSchema = z.object({
  vehicleSuggestion: z
    .string()
    .describe('The suggested vehicle type (e.g., car, motorcycle, truck).'),
  reasoning: z
    .string()
    .describe('The reasoning behind the vehicle suggestion.'),
});
export type SuggestOptimalVehicleOutput = z.infer<typeof SuggestOptimalVehicleOutputSchema>;

export async function suggestOptimalVehicle(input: SuggestOptimalVehicleInput): Promise<SuggestOptimalVehicleOutput> {
  return suggestOptimalVehicleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalVehiclePrompt',
  input: {schema: SuggestOptimalVehicleInputSchema},
  output: {schema: SuggestOptimalVehicleOutputSchema},
  prompt: `You are a ride-sharing expert, and will suggest the optimal vehicle for users.

  Based on the number of passengers, cargo volume, and traffic conditions, suggest the most suitable vehicle type.

  Passenger Count: {{{passengerCount}}}
  Cargo Volume: {{{cargoVolume}}}
  Traffic Conditions: {{{trafficConditions}}}

  Consider these vehicle options: car, motorcycle, truck, van, or SUV.
  Explain your reasoning for the suggestion.

  Vehicle Suggestion (one of car, motorcycle, truck, van, or SUV): {
    {vehicleSuggestion}}
  Reasoning: {
    {reasoning}}
  `,
});

const suggestOptimalVehicleFlow = ai.defineFlow(
  {
    name: 'suggestOptimalVehicleFlow',
    inputSchema: SuggestOptimalVehicleInputSchema,
    outputSchema: SuggestOptimalVehicleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
