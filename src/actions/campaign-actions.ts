"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateCampaignMessage } from "@/services/gemini";
import { getCustomersMatchingSegment } from "@/lib/segment-evaluator";
import { simulateCampaignDelivery } from "@/services/channel-simulator";

const CampaignSchema = z.object({
  name: z.string().min(2, "Campaign Name must be at least 2 characters long"),
  segmentId: z.string().min(1, "Segment selection is required"),
  channel: z.enum(["SMS", "EMAIL", "WHATSAPP"]),
  messageTemplate: z.string().min(10, "Template must be at least 10 characters long"),
});

export async function generateAITemplate(segmentId: string, channel: string, instructions?: string) {
  try {
    const segment = await db.segment.findUnique({
      where: { id: segmentId },
    });

    if (!segment) {
      return { error: "Segment not found" };
    }

    // Translate conditions array to human-readable format
    const conditions = (segment.criteria as any)?.conditions || [];
    const desc = conditions
      .map((c: any) => `${c.field} is ${c.operator} ${c.value}`)
      .join(", ");

    const copy = await generateCampaignMessage(segment.name, desc, channel, instructions);
    return { success: true, text: copy };
  } catch (err) {
    return { error: "Failed to generate AI copy" };
  }
}

export async function createCampaign(formData: FormData) {
  const name = formData.get("name") as string;
  const segmentId = formData.get("segmentId") as string;
  const channel = formData.get("channel") as any;
  const messageTemplate = formData.get("messageTemplate") as string;

  const result = CampaignSchema.safeParse({ name, segmentId, channel, messageTemplate });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    await db.campaign.create({
      data: {
        name,
        segmentId,
        channel,
        messageTemplate,
        status: "DRAFT",
      },
    });

    revalidatePath("/dashboard/campaigns");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create campaign. Please try again." };
  }
}

export async function sendCampaign(campaignId: string) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { segment: true },
    });

    if (!campaign) {
      return { error: "Campaign not found" };
    }

    if (campaign.status !== "DRAFT") {
      return { error: "Campaign has already been sent or is currently sending." };
    }

    // Fetch matching customers
    const matchedCustomers = await getCustomersMatchingSegment(campaign.segment.criteria);

    if (matchedCustomers.length === 0) {
      return { error: "This segment contains 0 customers. Cannot send campaign." };
    }

    // Set campaign status to SENDING
    await db.campaign.update({
      where: { id: campaignId },
      data: { status: "SENDING" },
    });

    // Create a CampaignLog entry for each customer (initially "SENT")
    for (const customer of matchedCustomers) {
      await db.campaignLog.create({
        data: {
          campaignId,
          customerId: customer.id,
          status: "SENT",
        },
      });
    }

    // Update campaign status to COMPLETED
    await db.campaign.update({
      where: { id: campaignId },
      data: { status: "COMPLETED" },
    });

    // Launch background simulator tasks to update statuses progressively via webhook callbacks
    await simulateCampaignDelivery(campaignId);

    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/analytics");
    return { success: true };
  } catch (error) {
    console.error("sendCampaign error:", error);
    return { error: "Failed to send campaign. Please try again." };
  }
}

export async function deleteCampaign(id: string) {
  try {
    await db.campaign.delete({
      where: { id },
    });
    revalidatePath("/dashboard/campaigns");
  } catch (error) {
    console.error("deleteCampaign error:", error);
  }
}
