import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit } from "@/utils/api/middleware/ratelimit";
import { userIdParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { persons, doctors, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/users/[id]
 * Get user profile data based on their role
 * - Patient: Returns their person record with relations
 * - Doctor: Returns their doctor record with relations
 * - Admin: Returns user data only
 * 
 * Access:
 * - Users can only access their own profile
 * - Admins can access any user's profile
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  // Authentication
  const session = await getAuthSession(request);
  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      },
      { status: StatusCodes.UNAUTHORIZED }
    );
  }

  const { id: userId, role } = session.user;
  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, userIdParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const requestedUserId = paramsValidationResult.data.id;

  // Authorization: Users can only access their own profile (unless admin)
  if (role !== Role.ADMIN && userId !== requestedUserId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "You can only access your own profile",
          code: "FORBIDDEN",
        },
      },
      { status: StatusCodes.FORBIDDEN }
    );
  }

  try {
    // Fetch user record
    const user = await db.query.users.findFirst({
      where: eq(users.id, requestedUserId),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "User not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Return role-based data
    if (user.role === Role.PATIENT) {
      // Fetch person record with relations
      const person = await db.query.persons.findFirst({
        where: eq(persons.userId, requestedUserId),
        with: {
          place: true,
          phones: true,
        },
      });

      if (!person) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Person profile not found for this user",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.NOT_FOUND }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              emailVerified: user.emailVerified,
              image: user.image,
            },
            person,
          },
        },
        { status: StatusCodes.OK }
      );
    }

    if (user.role === Role.DOCTOR) {
      // Fetch doctor record with relations
      const doctor = await db.query.doctors.findFirst({
        where: eq(doctors.userId, requestedUserId),
        with: {
          place: true,
          phones: true,
          educations: {
            with: {
              institution: {
                with: {
                  place: true,
                },
              },
            },
          },
          schedules: true,
          ageGroups: true,
          doctorServices: {
            with: {
              service: true,
            },
          },
          doctorTreatmentMethods: {
            with: {
              treatmentMethod: true,
            },
          },
          doctorConditions: {
            with: {
              condition: true,
            },
          },
          doctorLanguages: {
            with: {
              language: true,
            },
          },
        },
      });

      if (!doctor) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Doctor profile not found for this user",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.NOT_FOUND }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              emailVerified: user.emailVerified,
              image: user.image,
            },
            doctor,
          },
        },
        { status: StatusCodes.OK }
      );
    }

    // Admin or other roles - return user data only
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: user.emailVerified,
            image: user.image,
          },
        },
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
