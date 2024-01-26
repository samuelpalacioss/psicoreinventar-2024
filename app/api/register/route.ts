import prisma from '@/lib/db';
import { signUpSchema, signUpType } from '@/lib/validations/auth';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();

    const { name, email, password } = body;

    // ! Check if all fields are filled
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Provide all fields, try again' },
        {
          status: 400,
        }
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
          message: 'Email already exists',
          errors: { email: 'Email already exists' },
        },
        {
          status: 409,
        }
      );
    }

    //* Hash user password
    const hashedPassword = await bcrypt.hash(password, 10);

    // * Set first registered user as admin
    const isFirstAccount = (await prisma.user.count()) === 0;
    const role = isFirstAccount ? 'admin' : 'patient';

    //* Create user (if req.body is valid)
    const validatedData = signUpSchema.safeParse(body);

    if (validatedData.success) {
      //* Generate user image
      const userImg = `https://source.boringavatars.com/marble/80/${validatedData.data.name}?colors=fdf4b0,a4dcb9,5bcebf,32b9be,2e97b7`;

      const user = await prisma.user.create({
        data: {
          name: validatedData.data.name,
          email: validatedData.data.email,
          image: userImg,
          password: hashedPassword,
          role,
        },
      });

      //* Return user without password
      const { password: userPassword, ...rest } = user;

      return NextResponse.json(
        { user: rest, message: 'User created successfully' },
        {
          status: 201,
        }
      );
      // ! If req.body is invalid
    } else {
      let zodErrors = {};

      validatedData.error.issues.map((issue) => {
        zodErrors = { ...zodErrors, [issue.path[0]]: issue.message };
      });

      if (Object.keys(zodErrors).length > 0) {
        return NextResponse.json(
          { message: 'Validation error', errors: zodErrors },
          {
            status: 400,
          }
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Something went wrong' },
      {
        status: 500,
      }
    );
  }
}
