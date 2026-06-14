"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { parseCopilotInstruction } from "@/services/gemini";
import { getCustomersMatchingSegment } from "@/lib/segment-evaluator";

export async function processCopilotPrompt(prompt: string) {
  if (!prompt || prompt.trim().length < 5) {
    return { error: "Please enter a descriptive instruction." };
  }

  try {
    // Invoke Gemini to parse instruction into structured conditions & templates
    const recommendation = await parseCopilotInstruction(prompt);

    // Create the Dynamic Segment in DB
    const segment = await db.segment.create({
      data: {
        name: recommendation.segmentName,
        description: recommendation.segmentDescription,
        criteria: {
          conditions: recommendation.conditions,
        },
      },
    });

    // Create the Campaign draft linked to that segment
    const campaign = await db.campaign.create({
      data: {
        name: recommendation.campaignName,
        segmentId: segment.id,
        channel: recommendation.channel,
        messageTemplate: recommendation.messageTemplate,
        status: "DRAFT",
      },
    });

    // Calculate matched customer size
    const matches = await getCustomersMatchingSegment(segment.criteria);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/segments");
    revalidatePath("/dashboard/campaigns");
    
    return {
      success: true,
      segmentId: segment.id,
      campaignId: campaign.id,
      segmentName: segment.name,
      campaignName: campaign.name,
      channel: campaign.channel,
      matchedCount: matches.length,
      messageTemplate: campaign.messageTemplate,
    };
  } catch (error) {
    console.error("processCopilotPrompt error:", error);
    return { error: "AI Copilot failed to parse or build segment. Please try again." };
  }
}
