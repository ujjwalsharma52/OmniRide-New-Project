"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitRating } from "@/app/actions";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function RatingDialog({ rideId = "dummy-ride-id" }: { rideId?: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
     if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to submit feedback.",
        variant: "destructive",
      });
      return;
    }
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await submitRating({ rating, feedback }, rideId, user.uid);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping us improve.",
      });
      // Close dialog by finding the close button and clicking it programmatically
      document.getElementById('close-rating-dialog')?.click();
      setRating(0);
      setFeedback("");
    } else {
      toast({
        title: "Submission Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Rate Your Last Ride</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>How was your ride?</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve the OmniRide experience.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-8 w-8 cursor-pointer transition-colors",
                  (hoverRating || rating) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground"
                )}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
          <Textarea 
            placeholder="Tell us more about your experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)} 
          />
        </div>
        <DialogFooter>
           <DialogClose asChild>
             <Button id="close-rating-dialog" variant="ghost">Cancel</Button>
           </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
             {isLoading ? <Loader2 className="animate-spin" /> : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
