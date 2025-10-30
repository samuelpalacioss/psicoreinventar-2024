"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { DoctorRatingSchema, DoctorRatingType } from "@/lib/validations/doctor-rating";
import { submitDoctorRating } from "@/actions/doctor-rating";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import FormErrorMessage from "@/components/form-error-msg";
import FormSuccessMessage from "@/components/form-success-msg";

interface DoctorRatingFormProps {
  doctorProfileId: string;
  onSuccess?: () => void;
}

export function DoctorRatingForm({ doctorProfileId, onSuccess }: DoctorRatingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // const form = useForm<DoctorRatingType>({
  //   resolver: zodResolver(DoctorRatingSchema),
  //   defaultValues: {
  //     doctorProfileId,
  //     rating: 0,
  //     comment: "",
  //   },
  // });

  const {
    formState: { errors },
    setError,
  } = form;

  async function onSubmit(data: DoctorRatingType) {
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await submitDoctorRating(data);

      if (result.error) {
        setErrorMsg(result.error);
      } else if (result.success) {
        setSuccessMsg(result.success);
        form.reset();
        setSelectedRating(null);

        if (onSuccess) {
          onSuccess();
        }
      }

      if (result.errors) {
        const errors = result.errors as Record<string, string>;

        if (errors.rating) {
          setError("rating", {
            type: "server",
            message: errors.rating,
          });
        } else if (errors.comment) {
          setError("comment", {
            type: "server",
            message: errors.comment,
          });
        } else {
          setErrorMsg("Something went wrong with your rating submission");
        }
      }
    } catch (error) {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    form.setValue("rating", rating);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <FormLabel>Your Rating</FormLabel>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingClick(rating)}
                className="focus:outline-hidden"
              >
                <Icons.star
                  className={`h-8 w-8 ${
                    selectedRating && rating <= selectedRating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {form.formState.errors.rating && (
            <p className="text-sm text-red-500">{form.formState.errors.rating.message}</p>
          )}
        </div>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Comment (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience with this doctor..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormErrorMessage message={errorMsg} />
        <FormSuccessMessage message={successMsg} />

        <Button type="submit" disabled={isSubmitting || !selectedRating}>
          {isSubmitting ? "Submitting..." : "Submit Rating"}
        </Button>
      </form>
    </Form>
  );
}
