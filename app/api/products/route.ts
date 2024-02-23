import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { productSchema } from '@/lib/validations/product';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();

    const { name, description, isArchived, price, image, time } = body;

    //! Check if all fields are filled
    if (!name || !description || !isArchived || !price || !image || !time) {
      return NextResponse.json(
        {
          message: 'Please provide all fields',
        },
        {
          status: 400,
        }
      );
    }

    //* Validate data with zod
    const validatedData = productSchema.safeParse(body);

    //* If data is valid, create stripe product

    if (validatedData.success) {
      //* Create product on db
      const product = await prisma.product.create({
        data: {
          name: validatedData.data.name,
          description: validatedData.data.description,
          price: validatedData.data.price,
          isArchived: validatedData.data.isArchived,
          image: {
            create: [
              {
                url: validatedData.data.image,
              },
            ],
          },
          time: validatedData.data.time,
        },
      });
      return NextResponse.json(
        {
          message: 'Product created successfully',
          product: product,
        },
        {
          status: 201,
        }
      );
    } else {
      return NextResponse.json(
        {
          message: 'Please provide valid data',
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Something went wrong',
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
      },
      include: {
        image: true,
      },
    });
    return NextResponse.json(
      {
        message: 'Products fetched successfully',
        products: products,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Something went wrong',
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}
