"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Send,
  CheckCircle,
  XCircle,
  Eye,
  BookOpen,
  MousePointerClick,
  BarChart3,
} from "lucide-react";

interface Log {
  id: string;
  status: string;
  createdAt: Date;
  campaign: { name: string; channel: string };
  customer: { name: string; email: string };
}

const COLORS = ["#8b5cf6", "#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function AnalyticsDashboard({ logs }: { logs: Log[] }) {
  // Aggregate overall metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const sent = logs.filter((l) => ["SENT", "DELIVERED", "OPENED", "READ", "CLICKED"].includes(l.status)).length;
    const delivered = logs.filter((l) => ["DELIVERED", "OPENED", "READ", "CLICKED"].includes(l.status)).length;
    const failed = logs.filter((l) => l.status === "FAILED").length;
    const opened = logs.filter((l) => ["OPENED", "READ", "CLICKED"].includes(l.status)).length;
    const read = logs.filter((l) => ["READ", "CLICKED"].includes(l.status)).length;
    const clicked = logs.filter((l) => l.status === "CLICKED").length;

    // Rates relative to sent/delivered
    const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
    const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
    const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;

    return {
      total,
      sent,
      delivered,
      failed,
      opened,
      read,
      clicked,
      openRate,
      clickRate,
      deliveryRate,
    };
  }, [logs]);

  // Dynamic funnel chart data
  const funnelData = useMemo(() => {
    return [
      { step: "Sent", Count: metrics.sent },
      { step: "Delivered", Count: metrics.delivered },
      { step: "Opened", Count: metrics.opened },
      { step: "Read", Count: metrics.read },
      { step: "Clicked", Count: metrics.clicked },
    ];
  }, [metrics]);

  // Channel distribution data
  const channelData = useMemo(() => {
    const channels: Record<string, number> = {};
    logs.forEach((l) => {
      const ch = l.campaign.channel;
      channels[ch] = (channels[ch] || 0) + 1;
    });

    return Object.entries(channels).map(([name, value]) => ({
      name,
      value,
    }));
  }, [logs]);

  const stats = [
    { name: "Sent", value: metrics.sent, icon: Send, color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-800" },
    { name: "Delivered", value: metrics.delivered, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { name: "Failed", value: metrics.failed, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    { name: "Opened", value: metrics.opened, icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { name: "Read", value: metrics.read, icon: BookOpen, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { name: "Clicked", value: metrics.clicked, icon: MousePointerClick, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10 border-fuchsia-500/20" },
  ];

  return (
    <div className="space-y-8">
      {/* Rate indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <span className="text-xs text-zinc-500 font-bold uppercase block">Delivery Success Rate</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            {metrics.deliveryRate.toFixed(1)}%
          </h3>
        </div>
        <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <span className="text-xs text-zinc-500 font-bold uppercase block">Average Open Rate</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            {metrics.openRate.toFixed(1)}%
          </h3>
        </div>
        <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <span className="text-xs text-zinc-500 font-bold uppercase block">Conversion (CTR)</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            {metrics.clickRate.toFixed(1)}%
          </h3>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className={`p-4 border rounded-xl flex items-center justify-between bg-zinc-900/30 ${stat.bg}`}>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">{stat.name}</span>
              <span className="text-lg font-bold text-white mt-1 block">{stat.value}</span>
            </div>
            <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel chart */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-805 rounded-2xl p-6 h-[380px] flex flex-col">
          <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-1.5">
            <BarChart3 className="h-4.5 w-4.5 text-violet-400" />
            Campaign Funnel Metrics
          </h3>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="step" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="Count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Pie Chart */}
        <div className="bg-zinc-900/40 border border-zinc-805 rounded-2xl p-6 h-[380px] flex flex-col">
          <h3 className="text-sm font-bold text-zinc-200 mb-4">Channel Distribution</h3>
          {channelData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-600">
              No delivery channels used.
            </div>
          ) : (
            <div className="flex-1 w-full text-xs relative flex flex-col justify-center">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderColor: "#27272a",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend details */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                {channelData.map((d, idx) => (
                  <div key={d.name} className="flex flex-col items-center">
                    <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      {d.name}
                    </span>
                    <span className="text-xs font-bold text-white mt-0.5">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign logs table */}
      <div className="bg-zinc-900/40 border border-zinc-805 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-zinc-200 mb-4">Recent Event Callback Ledger</h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                <th className="pb-3 pr-4">Shopper</th>
                <th className="pb-3 pr-4">Campaign</th>
                <th className="pb-3 pr-4">Channel</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Logged Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {logs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-zinc-950/20 transition-all">
                  <td className="py-3 pr-4 font-medium text-zinc-200">
                    {log.customer.name}
                    <span className="block text-[10px] text-zinc-500 font-normal">{log.customer.email}</span>
                  </td>
                  <td className="py-3 pr-4 text-zinc-300">{log.campaign.name}</td>
                  <td className="py-3 pr-4 font-mono text-[10px] text-zinc-400">{log.campaign.channel}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        log.status === "CLICKED" || log.status === "READ"
                          ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20"
                          : log.status === "DELIVERED" || log.status === "OPENED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : log.status === "FAILED"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-zinc-850 text-zinc-400 border border-zinc-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-500">
                    {new Date(log.createdAt).toLocaleTimeString()} {new Date(log.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
