import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { productSchema } from "@/lib/validations/product";
import { stripe } from "@/lib/stripe";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "2 m"), // max requests per 2 minutes
  analytics: true,
});

export async function POST(req: Request, res: Response) {
  try {
    //* Rate limiter
    const ip = req.headers.get("x-forwarded-for") ?? "";
    const { success, pending, reset } = await ratelimit.limit(ip);

    if (!success) {
      const now = Date.now();
      const retryAfter = Math.floor((reset - now) / 1000);
      return NextResponse.json(
        {
          message: `Too many requests, please wait ${retryAfter}s`,
        },
        {
          status: 429,
        },
      );
    }

    const body = await req.json();

    const { name, description, isArchived, price, image, time } = body;

    //! Check if all fields are filled
    if (
      !name ||
      !description ||
      isArchived === null ||
      !price ||
      !image ||
      !time
    ) {
      return NextResponse.json(
        {
          message: "Please provide all fields",
        },
        {
          status: 400,
        },
      );
    }

    //* Validate data with zod
    const validatedData = productSchema.safeParse(body);

    //* If data is valid, create stripe product

    if (validatedData.success) {
      //* Create product on stripe
      const priceInCents = validatedData.data.price * 100; //* Convert price to cents
      const productPrice = Math.round(Number(priceInCents.toFixed(2))); //* Round to 2 decimals

      const product = await stripe.products.create({
        name: validatedData.data.name,
        description: validatedData.data.description,
        images: [validatedData.data.image],
        default_price_data: {
          currency: "usd",
          unit_amount: productPrice, // In cents
        },
        metadata: {
          time: validatedData.data.time, //* Adding time of the session
        },
      });

      //* Create product on db
      const newProduct = await prisma.product.create({
        data: {
          stripeId: product.id,
          name: validatedData.data.name,
          description: validatedData.data.description,
          price: validatedData.data.price,
          priceId: product.default_price as string,
          isArchived: validatedData.data.isArchived,
          image: validatedData.data.image,
          time: validatedData.data.time,
        },
      });
      return NextResponse.json(
        {
          message: "Product created successfully",
          product: newProduct,
        },
        {
          status: 201,
        },
      );
    } else {
      // if (validatedData.error instanceof ZodError) {
      //   return NextResponse.json(
      //     {
      //       message: 'Please provide valid data',
      //       error: validatedData.error.errors,
      //     },
      //     {
      //       status: 400,
      //     }
      //   );
      // }
      return NextResponse.json(
        {
          message: "Please provide valid data",
        },
        {
          status: 400,
        },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error,
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(req: Request, res: Response) {
  try {
    //* Rate limiter

    const ip = req.headers.get("x-forwarded-for") ?? "";
    const { success, pending, reset } = await ratelimit.limit(ip);

    if (!success) {
      const now = Date.now();
      const retryAfter = Math.floor((reset - now) / 1000);
      return NextResponse.json(
        {
          message: `Too many requests, please wait ${retryAfter}s`,
        },
        {
          status: 429,
        },
      );
    }

    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
      },
    });
    return NextResponse.json(
      {
        products: products,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error,
      },
      {
        status: 500,
      },
    );
  }
}
