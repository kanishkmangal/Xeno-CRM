"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const OrderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  totalAmount: z.number().positive("Amount must be greater than 0"),
  status: z.string().default("COMPLETED"),
});

export async function recalculateCustomerTotals(customerId: string) {
  // Fetch all customer orders to aggregate values, filtering spend to only COMPLETED
  const allOrders = await db.order.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });

  const totalSpend = allOrders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lastOrderDate = allOrders[0]?.createdAt || null;

  await db.customer.update({
    where: { id: customerId },
    data: {
      totalSpend,
      lastOrderDate,
    },
  });
}

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

    await recalculateCustomerTotals(customerId);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create order. Please check inputs and try again." };
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  if (!orderId || !newStatus) return { error: "Invalid data provided." };

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { status: true, customerId: true },
    });

    if (!order) {
      return { error: "Order not found." };
    }

    const currentStatus = order.status;

    // Validate state transitions
    if (currentStatus === "REFUNDED") {
      return { error: "Cannot update a REFUNDED order." };
    }

    if (currentStatus === "COMPLETED" && !["CANCELLED", "REFUNDED"].includes(newStatus)) {
      return { error: "COMPLETED orders can only transition to CANCELLED or REFUNDED." };
    }

    if (currentStatus === "CANCELLED" && newStatus !== "REFUNDED") {
      return { error: "CANCELLED orders can only transition to REFUNDED." };
    }

    if (currentStatus === "PENDING" && !["COMPLETED", "CANCELLED", "REFUNDED"].includes(newStatus)) {
      return { error: "PENDING orders can only transition to COMPLETED, CANCELLED, or REFUNDED." };
    }

    // Perform update
    await db.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // Recalculate customer spend
    await recalculateCustomerTotals(order.customerId);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/customers/${order.customerId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update order status", error);
    return { error: "An unexpected error occurred." };
  }
}
