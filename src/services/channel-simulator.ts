import { db } from "@/lib/db";

export async function simulateCampaignDelivery(campaignId: string) {
  // Fetch all initialized log entries for the campaign
  const logs = await db.campaignLog.findMany({
    where: { campaignId, status: "SENT" },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  for (const log of logs) {
    // Run asynchronous timeout loop without blocking main request thread
    (async () => {
      try {
        const statuses = ["SENT"];
        const isFailed = Math.random() < 0.1; // 10% failure rate

        if (isFailed) {
          statuses.push("FAILED");
        } else {
          statuses.push("DELIVERED");
          // 80% open rate
          if (Math.random() < 0.8) {
            statuses.push("OPENED");
            // 70% read rate
            if (Math.random() < 0.7) {
              statuses.push("READ");
              // 40% click rate
              if (Math.random() < 0.4) {
                statuses.push("CLICKED");
              }
            }
          }
        }

        // Simulates realistic delays between notification triggers
        for (let i = 1; i < statuses.length; i++) {
          const nextStatus = statuses[i];
          const delay = Math.random() * 1000 + 500; // 500ms to 1.5s delay
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Dispatch the simulator callback via fetch HTTP POST
          await fetch(`${appUrl}/api/campaigns/callback`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              campaignLogId: log.id,
              status: nextStatus,
            }),
          });
        }
      } catch (err) {
        console.error("Callback simulator failed for campaignLogId:", log.id, err);
      }
    })();
  }
}
