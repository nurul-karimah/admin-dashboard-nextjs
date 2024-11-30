import Navbar from "@/components/navbar";
import db from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  try {
    const store = await db.store.findFirst({
      where: {
        id: params.storeId,
        userId: userId,
      },
    });
  
    if (!store) {
      redirect('/');
      // throw new Error('Store not found');
    }
  } catch (error) {
    console.error('Error fetching store:', error);
  }
  
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}