import { prisma } from "@/lib/db";
import { signUpSchema, signUpType } from "@/lib/validations/auth";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { sendVerificationEmail } from "@/actions/email";
import { generateVerificationToken } from "@/lib/tokens";
import { Role } from "@prisma/client";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"), // max requests per hour
});

export async function POST(req: Request, res: Response) {
  try {
    //* Rate limiter
    const ip = req.headers.get("x-forwarded-for") ?? "";
    const { success, pending, reset } = await ratelimit.limit(ip);

    if (!success) {
      const now = Date.now();
      const retryAfter = Math.floor((reset - now) / 1000 / 60);

      return NextResponse.json(
        {
          errors: { limit: `Too many requests, please wait ${retryAfter}m` },
        },
        {
          status: 429,
        },
      );
    }

    const body = await req.json();

    const { name, email, password } = body;

    // ! Check if all fields are filled
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Provide all fields, try again" },
        {
          status: 400,
        },
      );
    }

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
    const role = isFirstAccount ? "doctor" : "patient";

    //* Create user (if req.body is valid)
    const validatedData = signUpSchema.safeParse(body);

    if (validatedData.success) {
      const user = await prisma.user.create({
        data: {
          name: validatedData.data.name,
          email: validatedData.data.email,
          password: hashedPassword,
          role,
        },
      });

      //* Return user without password
      const { password: userPassword, ...rest } = user;

      //* Generate email verification token
      const verificationToken = await generateVerificationToken(
        validatedData.data.email,
      );

      await sendVerificationEmail(
        validatedData.data.email,
        verificationToken.token,
      );

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
      // ! If req.body is invalid
    } else {
      let zodErrors = {};

      validatedData.error.issues.map((issue) => {
        zodErrors = { ...zodErrors, [issue.path[0]]: issue.message };
      });

      if (Object.keys(zodErrors).length > 0) {
        return NextResponse.json(
          { message: "Validation error", errors: zodErrors },
          {
            status: 400,
          },
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      {
        status: 500,
      },
    );
  }
}
