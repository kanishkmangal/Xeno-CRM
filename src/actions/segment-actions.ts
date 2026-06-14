"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SegmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  description: z.string().optional(),
  field: z.enum(["totalSpend", "lastOrderDays", "city"]),
  operator: z.enum(["gt", "lt", "equals"]),
  value: z.string().min(1, "Condition value is required"),
});

export async function createSegment(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const field = formData.get("field") as any;
  const operator = formData.get("operator") as any;
  const value = formData.get("value") as string;

  const result = SegmentSchema.safeParse({ name, description, field, operator, value });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  // Cast numeric value if applicable
  const parsedValue = field === "city" ? value : parseFloat(value);

  const criteria = {
    conditions: [
      {
        field,
        operator,
        value: parsedValue,
      },
    ],
  };

  try {
    await db.segment.create({
      data: {
        name,
        description: description || null,
        criteria,
      },
    });

    revalidatePath("/dashboard/segments");
    revalidatePath("/dashboard/campaigns");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create segment. Please try again." };
  }
}

export async function deleteSegment(id: string) {
  try {
    // Check if any campaigns use this segment
    const campaignCount = await db.campaign.count({
      where: { segmentId: id },
    });

    if (campaignCount > 0) {
      console.warn("Cannot delete segment. It is currently used in campaigns.");
      return;
    }

    await db.segment.delete({
      where: { id },
    });

    revalidatePath("/dashboard/segments");
  } catch (error) {
    console.error("deleteSegment error:", error);
  }
}
