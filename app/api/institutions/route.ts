import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { createInstitutionSchema, listInstitutionsSchema } from "@/lib/api/schemas/simple.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { institutions } from "@/src/db/schema";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/institutions
 * List all institutions with pagination and search
 * Public access (no auth required for reading)
 */

export async function GET(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const validationResult = validateSearchParams(
    request.nextUrl.searchParams,
    listInstitutionsSchema
  );
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    const conditions = [];
    if (params.search) {
      conditions.push(ilike(institutions.name, `%${params.search}%`));
    }
    if (params.type) {
      conditions.push(eq(institutions.type, params.type));
    }
    if (params.placeId) {
      conditions.push(eq(institutions.placeId, params.placeId));
    }
    if (params.isVerified !== undefined) {
      conditions.push(eq(institutions.isVerified, params.isVerified));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countQuery = db.select({ count: count() }).from(institutions);
    if (whereClause) countQuery.where(whereClause);
    const [{ count: totalCount }] = await countQuery;

    const dataQuery = db.select().from(institutions).limit(limit).offset(offset);
    if (whereClause) dataQuery.where(whereClause);
    const data = await dataQuery;

    const pagination = calculatePaginationMetadata(page, limit, totalCount);

    return NextResponse.json({ success: true, data, pagination }, { status: StatusCodes.OK });
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/institutions
 * Create a new institution
 * Admin only
 */

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: StatusCodes.UNAUTHORIZED }
    );
  }

  const { id: userId, role } = session.user;
  const authzResult = await checkResourceAccess(userId, role as Role, "institution", "create");
  if (!authzResult.allowed) return authzResult.error;

  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createInstitutionSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check for duplicate name and type
    const existing = await db.query.institutions.findFirst({
      where: and(
        ilike(institutions.name, validatedData.name),
        eq(institutions.type, validatedData.type)
      ),
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Institution with this name and type already exists",
            code: "DUPLICATE_ENTRY",
          },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

    // Doctors create unverified institutions, admins can create verified
    const isVerified = role === Role.ADMIN && validatedData.isVerified === true;

    const [institution] = await db
      .insert(institutions)
      .values({
        ...validatedData,
        isVerified,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: institution,
        message: isVerified
          ? "Institution created successfully"
          : "Institution created and pending verification",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating institution:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
