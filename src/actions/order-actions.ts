"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const OrderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  totalAmount: z.number().positive("Amount must be greater than 0"),
  status: z.string().default("COMPLETED"),
});

export async function createOrder(formData: FormData) {
  const customerId = formData.get("customerId") as string;
  const totalAmountStr = formData.get("totalAmount") as string;
  const totalAmount = parseFloat(totalAmountStr);
  const status = (formData.get("status") as string) || "COMPLETED";

  const result = OrderSchema.safeParse({ customerId, totalAmount, status });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    // Insert order in database
    await db.order.create({
      data: {
        customerId,
        totalAmount,
        status,
      },
    });

    // Fetch all customer orders to aggregate values
    const customerOrders = await db.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    const totalSpend = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const lastOrderDate = customerOrders[0]?.createdAt || null;

    // Update customer aggregated fields
    await db.customer.update({
      where: { id: customerId },
      data: {
        totalSpend,
        lastOrderDate,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create order. Please check inputs and try again." };
  }
}
