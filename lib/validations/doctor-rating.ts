import { z } from "zod";

export const DoctorRatingSchema = z.object({
  doctorProfileId: z.string().min(1, "Doctor is required"),
  rating: z.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().optional(),
});

export type DoctorRatingType = z.infer<typeof DoctorRatingSchema>;
