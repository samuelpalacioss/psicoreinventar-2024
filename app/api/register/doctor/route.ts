import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { doctorSignUpSchema } from '@/lib/validations/doctor';

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      password,
      phone,
      licenseNumber,
      experience,
      graduationYear,
      specialties,
      education,
      description,
      clientExpectations,
      treatmentMethods,
      strengths,
    } = body;

    //! Check if all fields are filled
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !licenseNumber ||
      !experience ||
      !graduationYear ||
      !specialties ||
      !education ||
      !description ||
      !clientExpectations ||
      !treatmentMethods ||
      !strengths
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

    //* Hash password
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
          doctorProfile: {
            create: {
              licenseNumber: validatedData.data.licenseNumber,
              experience: validatedData.data.experience,
              graduationYear: validatedData.data.graduationYear,
              education: validatedData.data.education,
              specialties: {
                connect: validatedData.data.specialties.map((specialty) => ({
                  name: specialty.label,
                })),
              },
              clientExpectations: validatedData.data.clientExpectations,
              treatmentMethods: validatedData.data.treatmentMethods,
              strengths: validatedData.data.strengths,
              description: validatedData.data.description,
            },
          },
        },
      });

      //* Return user without password
      const { password: userPassword, ...rest } = user;

      return NextResponse.json(
        {
          user: rest,
          message: 'Doctor created successfully',
          success: 'Welcome to the team! Please check your email for further instructions.',
        },
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
