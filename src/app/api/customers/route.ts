import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const spendOperator = searchParams.get("spendOperator") || "";
    const spendValue = searchParams.get("spendValue") || "";
    const days = searchParams.get("days") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: any = { AND: [] };

    // Search query matches: name, email, or city contains search string
    if (q) {
      where.AND.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    // City filter
    if (city && city !== "ALL") {
      where.AND.push({ city: { equals: city, mode: "insensitive" } });
    }

    // Total Spend filter
    if (spendOperator && spendValue) {
      const val = parseFloat(spendValue);
      if (!isNaN(val)) {
        if (spendOperator === "gt") {
          where.AND.push({ totalSpend: { gt: val } });
        } else if (spendOperator === "lt") {
          where.AND.push({ totalSpend: { lt: val } });
        } else if (spendOperator === "equals") {
          where.AND.push({ totalSpend: { equals: val } });
        }
      }
    }

    // Last Order relative date filter (ordered within last N days)
    if (days) {
      const daysNum = parseInt(days);
      if (!isNaN(daysNum)) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysNum);
        where.AND.push({ lastOrderDate: { gte: cutoffDate } });
      }
    }

    // Clean empty where queries
    if (where.AND.length === 0) {
      delete where.AND;
    }

    // Fetch total count and paginated matching records
    const [customers, totalCount] = await Promise.all([
      db.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.customer.count({ where }),
    ]);

    return NextResponse.json({
      customers,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("GET API customers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer list" },
      { status: 500 }
    );
  }
}