import { db } from "@/lib/db";
import {
  Users,
  ShoppingBag,
  Send,
  IndianRupee,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // Disable caching so it's always live data

export default async function DashboardPage() {
  // Database queries for real-time CRM stats
  const [
  totalCustomers,
  totalOrders,
  totalCampaigns,
  revenueAggregation,
  recentCampaigns,
] = await Promise.all([
  db.customer.count(),
  db.order.count(),
  db.campaign.count(),
  db.order.aggregate({
    where: { status: "COMPLETED" },
    _sum: {
      totalAmount: true,
    },
  }),
  db.campaign.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      segment: true,
    },
  }),
]);
const totalRevenue = revenueAggregation._sum.totalAmount || 0;
  const stats = [
    {
      name: "Total Customers",
      value: totalCustomers.toLocaleString(),
      icon: Users,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      name: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Total Campaigns",
      value: totalCampaigns.toLocaleString(),
      icon: Send,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: IndianRupee,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];
  
  return (
    <div className="space-y-8">
      {/* Header section with AI Callout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Overview
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Monitor real-time customer growth, purchase history, and marketing campaign performance.
          </p>
        </div>
        <Link
          href="/dashboard/copilot"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold shadow-lg shadow-violet-500/20 transition-all self-start md:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          Ask Copilot
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`p-6 rounded-2xl border bg-zinc-900/40 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-zinc-900/60 ${stat.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">
                {stat.name}
              </span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-white">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Campaigns & Copilot Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Campaigns Card */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Recent Campaigns
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Overview of last dispatched communication campaigns.
              </p>
            </div>
            <Link
              href="/dashboard/campaigns"
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 hover:underline"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentCampaigns.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm">
                No campaigns generated yet. Start one using the campaign builder or AI Copilot.
              </div>
            ) : (
              recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl hover:border-zinc-700/80 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-200">
                      {campaign.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="bg-zinc-800/80 px-2 py-0.5 rounded-md text-[10px] uppercase font-mono text-zinc-400 border border-zinc-700/50">
                        {campaign.channel}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[150px]">
                        Segment: {campaign.segment.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : campaign.status === "FAILED"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Marketing Widget */}
        <div className="bg-gradient-to-br from-violet-950/30 to-indigo-950/20 border border-violet-800/20 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-white text-md">
                AI Copilot Marketing Decisions
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Automate your segmentation and campaign workflows instantly. Type plain text descriptions like:
              </p>
            </div>

            <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg font-mono text-xs text-violet-300">
              &quot;Bring back customers who haven&apos;t ordered in 60 days&quot;
            </div>
          </div>

          <Link
            href="/dashboard/copilot"
            className="w-full text-center mt-6 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-800 text-zinc-200 font-medium text-xs transition-colors"
          >
            Launch AI Assistant
          </Link>
        </div>
      </div>
    </div>
  );
}
