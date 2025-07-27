'use server';

/**
 * @fileOverview A flow for analyzing user feedback for a ride.
 *
 * - analyzeFeedback - A function that analyzes the sentiment and category of user feedback.
 */

import {ai} from '@/ai/genkit';
import { AnalyzeFeedbackInputSchema, AnalyzeFeedbackOutputSchema, type AnalyzeFeedbackInput, type AnalyzeFeedbackOutput } from '@/ai/schemas';

export async function analyzeFeedback(input: AnalyzeFeedbackInput): Promise<AnalyzeFeedbackOutput> {
  return analyzeFeedbackFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeFeedbackPrompt',
  input: {schema: AnalyzeFeedbackInputSchema},
  output: {schema: AnalyzeFeedbackOutputSchema},
  prompt: `You are a feedback analysis expert for a ride-sharing app.
    Analyze the following user feedback and determine its sentiment and primary category.

    User Rating: {{{rating}}}/5
    User Feedback: "{{{feedback}}}"

    Based on the feedback, determine if the sentiment is positive, negative, or neutral.
    Then, classify the feedback into one of the following categories:
    - Driver (related to the driver's behavior, professionalism, driving)
    - Vehicle (related to the car's cleanliness, comfort, condition)
    - Route (related to the path taken, duration, traffic)
    - Pricing (related to the cost of the ride)
    - App Experience (related to using the app itself)
    - General (for feedback that doesn't fit other categories)

    Provide your analysis in the specified JSON format.
  `,
});

const analyzeFeedbackFlow = ai.defineFlow(
  {
    name: 'analyzeFeedbackFlow',
    inputSchema: AnalyzeFeedbackInputSchema,
    outputSchema: AnalyzeFeedbackOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
