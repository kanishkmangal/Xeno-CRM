import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const customers = await db.customer.findMany();

  return NextResponse.json(customers);
}