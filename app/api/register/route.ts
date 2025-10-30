import { prisma } from "@/lib/db";
import { signUpSchema, signUpType } from "@/lib/validations/auth";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { sendVerificationEmail } from "@/actions/email";
import { generateVerificationToken } from "@/lib/tokens";
import { Role } from "@/types/enums";
import { redis } from "@/lib/redis";

// const ratelimit = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(5, "1 h"), // max requests per hour
//   analytics: true,
// });

export async function POST(req: Request, res: Response) {
  try {
    //* Check database connection
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is not set in environment variables");
      return NextResponse.json(
        {
          message: "Database configuration error",
          error: "DATABASE_URL environment variable is missing",
        },
        {
          status: 500,
        },
      );
    }

    // //* Rate limiter
    // const ip = req.headers.get("x-forwarded-for") ?? "";
    // const { success, pending, reset } = await ratelimit.limit(ip);

    // if (!success) {
    //   const now = Date.now();
    //   const retryAfter = Math.floor((reset - now) / 1000 / 60);

    //   return NextResponse.json(
    //     {
    //       errors: { limit: `Too many requests, please wait ${retryAfter}m` },
    //     },
    //     {
    //       status: 429,
    //     },
    //   );
    // }

    const body = await req.json();

    //* Validate request body first
    const validatedData = signUpSchema.safeParse(body);

    if (!validatedData.success) {
      const zodErrors: Record<string, string> = {};

      validatedData.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        zodErrors[field] = issue.message;
      });

      return NextResponse.json(
        { message: "Validation error", errors: zodErrors },
        {
          status: 400,
        },
      );
    }

    const { name, email, password } = validatedData.data;

    // ! Check if email already exists
    const emailAlreadyExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    //* Passing errors to the client
    if (emailAlreadyExists) {
      return NextResponse.json(
        {
          message: "Email already exists",
          errors: { email: "Email already exists" },
        },
        {
          status: 409,
        },
      );
    }

    //* Hash user password
    const hashedPassword = await bcrypt.hash(password, 10);

    // * Set first registered user as doctor
    const isFirstAccount = (await prisma.user.count()) === 0;
    const role = isFirstAccount ? Role.DOCTOR : Role.PATIENT;

    //* Create user (validation already passed, so validatedData.data is safe to use)
    const user = await prisma.user.create({
      data: {
        name: validatedData.data.name,
        email: validatedData.data.email,
        password: hashedPassword,
        role,
      },
    });

    const userFirstname = user.name!.split(" ")[0];

    //* Return user without password
    const { password: userPassword, ...rest } = user;

    //* Generate email verification token
    const verificationToken = await generateVerificationToken(
      validatedData.data.email,
    );

    //* Send verification email (non-blocking - don't fail registration if email fails)
    const emailResult = await sendVerificationEmail(
      validatedData.data.email,
      userFirstname,
      verificationToken.token,
    );

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
    }

    return NextResponse.json(
      {
        user: rest,
        message: "User created successfully",
        success: "Confirmation email sent!",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    // Log error for debugging
    console.error("Registration error:", error);
    
    // Handle specific database connection errors
    let errorMessage = "Something went wrong";
    if (error instanceof Error) {
      if (error.message.includes("Tenant or user not found")) {
        errorMessage = "Database connection failed. Please check your DATABASE_URL in .env file.";
        console.error("\n💡 Database connection issue detected!");
        console.error("   This usually means:");
        console.error("   1. The database password is incorrect");
        console.error("   2. The database host/URL is incorrect");
        console.error("    For Supabase: Check your connection string in Settings > Database");
        console.error("   3. The database user doesn't exist or was deleted");
      }
    }
    
    // Return user-friendly error message
    return NextResponse.json(
      { 
        message: errorMessage,
        error: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      {
        status: 500,
      },
    );
  }
}
