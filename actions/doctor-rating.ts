"use server";

import { prisma } from "@/lib/db";
import { DoctorRatingSchema, DoctorRatingType } from "@/lib/validations/doctor-rating";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { auth } from "@/auth";

export async function submitDoctorRating(data: DoctorRatingType) {
  try {
    // Validate input data
    const validatedData = DoctorRatingSchema.parse(data);

    const session = await auth();

    // Check if user is logged in and is a patient
    if (!session?.user || session.user.role !== "patient") {
      throw new Error("You must be logged in to access this route");
    }

    // Check if doctor exists
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { id: validatedData.doctorProfileId },
    });

    if (!doctorProfile) {
      return { error: "Doctor not found." };
    }

    // Check if rating is valid (1-5)
    if (validatedData.rating < 1 || validatedData.rating > 5) {
      return {
        errors: {
          rating: "Rating must be between 1 and 5",
        },
      };
    }

    // Check if user has already rated this doctor
    const existingRating = await prisma.doctorRating.findUnique({
      where: {
        patientId_doctorProfileId: {
          patientId: session.user.id!,
          doctorProfileId: validatedData.doctorProfileId,
        },
      },
    });

    if (existingRating) {
      // Update existing rating
      await prisma.doctorRating.update({
        where: { id: existingRating.id },
        data: {
          rating: validatedData.rating,
          comment: validatedData.comment,
          updatedAt: new Date(),
        },
      });

      revalidatePath(`/find/${doctorProfile.userId}`);
      return { success: "Rating updated successfully." };
    }

    // Create new rating
    await prisma.doctorRating.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        patientId: session.user.id!,
        doctorProfileId: validatedData.doctorProfileId,
      },
    });

    revalidatePath(`/find/${doctorProfile.userId}`);
    return { success: "Rating submitted successfully." };
  } catch (error) {
    console.error("Error submitting doctor rating:", error);

    // Check if it's a Zod validation error
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};

      error.errors.forEach((err) => {
        const field = err.path[0];
        if (field) {
          fieldErrors[field.toString()] = err.message;
        }
      });

      return { errors: fieldErrors };
    }

    return { error: "Failed to submit rating. Please try again." };
  }
}

// Get average rating for a doctor
export async function getDoctorAverageRating(doctorProfileId: string) {
  try {
    const ratings = await prisma.doctorRating.findMany({
      where: { doctorProfileId },
      select: { rating: true },
    });

    if (ratings.length === 0) {
      return { averageRating: 0, totalRatings: 0 };
    }

    const sum = ratings.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0);
    const average = sum / ratings.length;

    return {
      averageRating: parseFloat(average.toFixed(1)),
      totalRatings: ratings.length,
    };
  } catch (error) {
    console.error("Error getting doctor average rating:", error);
    return { error: "Failed to get doctor rating." };
  }
}

// Get all ratings for a doctor
export async function getDoctorRatings(doctorProfileId: string) {
  try {
    const ratings = await prisma.doctorRating.findMany({
      where: { doctorProfileId },
      include: {
        patient: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { ratings };
  } catch (error) {
    console.error("Error getting doctor ratings:", error);
    return { error: "Failed to get doctor ratings." };
  }
}
