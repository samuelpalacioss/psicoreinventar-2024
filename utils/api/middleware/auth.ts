import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { Role } from "@/types/enums";

/**
 * Session type matching your better-auth session structure
 */
export type AuthSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
} | null;

/**
 * Get authenticated session with development mode support
 *
 * In development mode (NODE_ENV=development):
 * - Checks for 'Authorization: Bearer <token>' header
 * - If token matches DEV_AUTH_TOKEN from .env, returns a mock admin session
 * - Otherwise, falls back to regular session auth
 *
 * In production:
 * - Always uses getServerSession()
 *
 * Usage in API routes:
 * ```ts
 * const session = await getAuthSession(request);
 * if (!session?.user) {
 *   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 * }
 * ```
 *
 * Testing with curl:
 * ```bash
 * curl -X POST http://localhost:3000/api/services \
 *   -H "Authorization: Bearer your_dev_token" \
 *   -H "Content-Type: application/json" \
 *   -d '{"name":"Test Service","description":"Test"}'
 * ```
 */
export async function getAuthSession(request: NextRequest): Promise<AuthSession> {
  // Development mode: check for dev token
  if (process.env.NODE_ENV === "development" && process.env.DEV_AUTH_TOKEN) {
    const authHeader = request.headers.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (token === process.env.DEV_AUTH_TOKEN) {
        // Return mock admin session for development
        return {
          // Admin testing
          // user: {
          //   id: "dev-admin-id",
          //   email: "dev@admin.local",
          //   name: "Dev Admin",
          //   role: Role.ADMIN,
          // },
          // Doctor testing
          // user: {
          //   id: "4624a8d7-c31d-4a8f-9984-814ac515ca94", // User Id of doctor with id 1
          //   email: "doc1@user.local",
          //   name: "Doc 1",
          //   role: Role.DOCTOR,
          // },
          // user: {
          //   id: "d8658ccc-8e4e-43f0-9666-341275afed54", // User Id of doctor with id 1
          //   email: "doc4@user.local",
          //   name: "Doc 4",
          //   role: Role.DOCTOR,
          // },
          // Patient testing
          user: {
            id: "4dcf834b-d380-47bb-9cb3-a26da3f85862", // User id of person with id 1
            email: "patient1@user.local",
            name: "Patient 1 User",
            role: Role.PATIENT,
          },
        };
      }
    }
  }

  // Production or no dev token: use regular session
  const session = await getServerSession();
  return session as AuthSession;
}

/**
 * Extract session and return standardized auth response
 * Handles both dev token and regular session authentication
 *
 * @returns Object with session or error response
 */
export async function requireAuth(request: NextRequest) {
  const session = await getAuthSession(request);

  if (!session?.user) {
    return {
      session: null,
      error: {
        success: false,
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      },
    };
  }

  return {
    session,
    error: null,
  };
}
