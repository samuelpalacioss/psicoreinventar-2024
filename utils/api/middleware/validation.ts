import { NextResponse } from "next/server";
import * as z from "zod";
import { StatusCodes } from "http-status-codes";

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: NextResponse<{
        success: false;
        error: { message: string; code: string; details?: any };
      }>;
    };

/**
 * Validate request body against a Zod schema
 *
 * @param body - The request body to validate
 * @param schema - Zod schema to validate against
 * @returns Validation result with parsed data or error response
 */
export function validateBody<T>(body: unknown, schema: z.ZodType<T>): ValidationResult<T> {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            error: {
              message: "Validation error",
              code: "VALIDATION_ERROR",
              details: error.issues,
            },
          },
          { status: StatusCodes.BAD_REQUEST }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid request body",
            code: "INVALID_BODY",
          },
        },
        { status: StatusCodes.BAD_REQUEST }
      ),
    };
  }
}

/**
 * Validate URL search params against a Zod schema
 *
 * @param searchParams - URL search params
 * @param schema - Zod schema to validate against
 * @returns Validation result with parsed data or error response
 */
export function validateSearchParams<T>(searchParams: URLSearchParams, schema: z.ZodType<T>): ValidationResult<T> {
  try {
    // Convert URLSearchParams to object
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            error: {
              message: "Invalid query parameters",
              code: "VALIDATION_ERROR",
              details: error.issues,
            },
          },
          { status: StatusCodes.BAD_REQUEST }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid query parameters",
            code: "INVALID_PARAMS",
          },
        },
        { status: StatusCodes.BAD_REQUEST }
      ),
    };
  }
}

/**
 * Validate route parameters (like [id]) against a Zod schema
 *
 * @param params - Route params object
 * @param schema - Zod schema to validate against
 * @returns Validation result with parsed data or error response
 */
export function validateParams<T>(params: unknown, schema: z.ZodType<T>): ValidationResult<T> {
  try {
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            error: {
              message: "Invalid route parameters",
              code: "VALIDATION_ERROR",
              details: error.issues,
            },
          },
          { status: StatusCodes.BAD_REQUEST }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid route parameters",
            code: "INVALID_PARAMS",
          },
        },
        { status: StatusCodes.BAD_REQUEST }
      ),
    };
  }
}
