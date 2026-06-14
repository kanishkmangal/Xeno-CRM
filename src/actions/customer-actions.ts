"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City must be at least 2 characters long"),
});

export async function createCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;

  const result = CustomerSchema.safeParse({ name, email, phone, city });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    const existing = await db.customer.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: "A customer with this email already exists." };
    }

    await db.customer.create({
      data: {
        name,
        email,
        phone: phone || null,
        city,
        totalSpend: 0,
      },
    });

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create customer. Please try again." };
  }
}

export async function updateCustomer(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;

  const result = CustomerSchema.safeParse({ name, email, phone, city });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    const existing = await db.customer.findFirst({
      where: { email, NOT: { id } },
    });

    if (existing) {
      return { error: "Another customer with this email already exists." };
    }

    await db.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone: phone || null,
        city,
      },
    });

    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/customers/${id}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to update customer. Please try again." };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await db.customer.delete({
      where: { id },
    });

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete customer." };
  }
}
