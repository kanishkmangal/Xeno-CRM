import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { campaignLogId, status } = await req.json();

    if (!campaignLogId || !status) {
      return NextResponse.json(
        { error: "Missing parameters: campaignLogId and status" },
        { status: 400 }
      );
    }

    // Update campaign log status
    const updated = await db.campaignLog.update({
      where: { id: campaignLogId },
      data: { status },
    });

    return NextResponse.json({ success: true, log: updated });
  } catch (error) {
    console.error("Callback API error:", error);
    return NextResponse.json(
      { error: "Failed to process campaign callback" },
      { status: 500 }
    );
  }
}
