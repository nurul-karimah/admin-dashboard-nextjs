import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import db from "@/lib/db";

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
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
