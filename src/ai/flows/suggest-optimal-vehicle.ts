'use server';

/**
 * @fileOverview Vehicle suggestion AI agent.
 *
 * - suggestOptimalVehicle - A function that suggests the optimal vehicle based on the number of passengers, cargo volume, and traffic conditions.
 */

import {ai} from '@/ai/genkit';
import { SuggestOptimalVehicleInputSchema, SuggestOptimalVehicleOutputSchema, type SuggestOptimalVehicleInput, type SuggestOptimalVehicleOutput } from '@/ai/schemas';

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
