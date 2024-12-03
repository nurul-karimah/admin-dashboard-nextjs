import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, price, categoryId, description, benefits, usage, images, isFeatured, isArchived } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Nama perlu diinput", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Image perlu diinput", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Harga perlu diinput", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Kategori perlu diinput", { status: 400 });
    }
    if (!description) {
      return new NextResponse("Deskripsi perlu diinput", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id URL dibutuhkan");
    }

    const storeByUserId = await db.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const processedUsage = usage.replace(/\n/g, "<br>");

    const product = await db.product.create({
      data: {
        name,
        price,
        categoryId,
        isFeatured,
        isArchived,
        description,
        benefits,
        usage: processedUsage,
        storeId: params.storeId,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const isFeatured = searchParams.get("isFeatured");
    const search = searchParams.get("search")?.toLowerCase() || ""; // Mendapatkan kata kunci pencarian

    if (!params.storeId) {
      return new NextResponse("Store id URL dibutuhkan");
    }

    const products = await db.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
        AND: [
          {
            OR: [
              {
                name: {
                  contains: search, // Pencarian berdasarkan name
                  // mode: "insensitive", // Tidak perlu menggunakan mode di sini
                },
              },
              {
                description: {
                  contains: search, // Pencarian berdasarkan description
                  // mode: "insensitive", // Tidak perlu menggunakan mode di sini
                },
              },
              {
                category: {
                  name: {
                    contains: search, // Pencarian berdasarkan kategori name
                    // mode: "insensitive", // Tidak perlu menggunakan mode di sini
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        images: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}

