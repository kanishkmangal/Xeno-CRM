import { db } from "@/lib/db";
import AnalyticsDashboard from "./analytics-dashboard";

export const revalidate = 0;

export default async function AnalyticsPage() {
  const logs = await db.campaignLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      campaign: {
        select: {
          name: true,
          channel: true,
        },
      },
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Analytics Hub
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Monitor campaign conversions, delivery rate ratios, funnel progressions, and message dispatches.
        </p>
      </div>

      <AnalyticsDashboard logs={logs} />
    </div>
  );
}
