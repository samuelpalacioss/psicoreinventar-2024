import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  const body = await req.json();

  const { name } = body;

  // ! Check for field filled
  if (!name) {
    return NextResponse.json(
      { message: 'Provide all fields, try again' },
      {
        status: 400,
      }
    );
  }

  const specialty = await prisma.specialty.create({
    data: {
      name,
    },
  });

  return NextResponse.json({ specialty });
}
