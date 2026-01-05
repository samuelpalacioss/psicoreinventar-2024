import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { createLanguageSchema, listLanguagesSchema } from "@/lib/api/schemas/simple.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { languages } from "@/src/db/schema";
import { and, count, ilike } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/languages
 * List all languages with pagination and search
 * Public access (no auth required for reading)
 */

export async function GET(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const validationResult = validateSearchParams(request.nextUrl.searchParams, listLanguagesSchema);
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    const conditions = [];
    if (params.search) {
      conditions.push(ilike(languages.name, `%${params.search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countQuery = db.select({ count: count() }).from(languages);
    if (whereClause) countQuery.where(whereClause);
    const [{ count: totalCount }] = await countQuery;

    const dataQuery = db.select().from(languages).limit(limit).offset(offset);
    if (whereClause) dataQuery.where(whereClause);
    const data = await dataQuery;

    const pagination = calculatePaginationMetadata(page, limit, totalCount);

    return NextResponse.json({ success: true, data, pagination }, { status: StatusCodes.OK });
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/languages
 * Create a new language
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
  const authzResult = await checkResourceAccess(userId, role as Role, "language", "create");
  if (!authzResult.allowed) return authzResult.error;

  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createLanguageSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    const existing = await db.query.languages.findFirst({
      where: ilike(languages.name, validatedData.name),
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Language with this name already exists", code: "DUPLICATE_ENTRY" },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

    const [language] = await db.insert(languages).values(validatedData).returning();

    return NextResponse.json(
      { success: true, data: language, message: "Language created successfully" },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating language:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
