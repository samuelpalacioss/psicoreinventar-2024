import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { doctorSignUpSchema } from '@/lib/validations/doctor';

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();

    const { name, email, password, phone, doctorExperience, doctorSpecialties, doctorEducation } =
      body;

    //! Check if all fields are filled
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !doctorExperience ||
      !doctorSpecialties ||
      !doctorEducation
    ) {
      return NextResponse.json(
        { message: 'Provide all fields, try again' },
        {
          status: 400,
        }
      );
    }

    //! Check if email already exists
    const emailAlreadyExists = await prisma.user.findUnique({
      where: { email: email },
    });

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

    //* Hash doctor password
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'doctor';

    //* Validate doctor data

    const validatedData = doctorSignUpSchema.safeParse(body);

    if (validatedData.success) {
      const user = await prisma.user.create({
        data: {
          name: validatedData.data.name,
          email: validatedData.data.email,
          phone: validatedData.data.phone,

          password: hashedPassword,
          role,
          doctorExperience: validatedData.data.doctorExperience,
          doctorSpecialties: {
            connect: validatedData.data.doctorSpecialties.map((specialty) => ({
              id: specialty,
            })),
          },
          doctorEducation: validatedData.data.doctorEducation,
        },
      });

      //* Return user without password
      const { password: userPassword, ...rest } = user;

      return NextResponse.json(
        { user: rest, message: 'Doctor created successfully' },
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
      { message: 'Something went wrong', error },
      {
        status: 500,
      }
    );
  }
}
