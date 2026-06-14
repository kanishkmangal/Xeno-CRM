import { db } from "@/lib/db";

export async function getCustomersMatchingSegment(criteria: any) {
  const conditions = criteria?.conditions || [];
  if (conditions.length === 0) {
    return [];
  }

  const whereClause: any = { AND: [] };

  for (const cond of conditions) {
    const { field, operator, value } = cond;

    if (field === "totalSpend") {
      const numVal = parseFloat(value);
      if (operator === "gt") {
        whereClause.AND.push({ totalSpend: { gt: numVal } });
      } else if (operator === "lt") {
        whereClause.AND.push({ totalSpend: { lt: numVal } });
      } else if (operator === "equals") {
        whereClause.AND.push({ totalSpend: { equals: numVal } });
      }
    } else if (field === "city") {
      if (operator === "equals") {
        whereClause.AND.push({ city: { equals: value, mode: "insensitive" } });
      }
    } else if (field === "lastOrderDays") {
      const days = parseInt(value);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      if (operator === "gt") {
        whereClause.AND.push({
          OR: [
            { lastOrderDate: { lt: cutoffDate } },
            { lastOrderDate: null },
          ],
        });
      } else if (operator === "lt") {
        whereClause.AND.push({
          lastOrderDate: { gte: cutoffDate },
        });
      }
    }
  }

  return await db.customer.findMany({
    where: whereClause,
  });
}
