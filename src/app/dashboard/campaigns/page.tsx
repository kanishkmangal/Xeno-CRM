import { db } from "@/lib/db";
import CampaignForm from "./campaign-form";
import SendCampaignButton from "./send-campaign-button";
import { Layers } from "lucide-react";
import { Trash2 } from "lucide-react";
import { deleteCampaign } from "@/actions/campaign-actions";

export const revalidate = 0;

export default async function CampaignsPage() {
  const campaigns = await db.campaign.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      segment: true,
      logs: true,
    },
  });

  const segments = await db.segment.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Campaigns
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Design messaging drafts, select target segments, generated template texts, and trigger simulator runs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <CampaignForm segments={segments} />
        </div>

        {/* Right Column: Campaigns list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
            <h2 className="text-sm font-bold text-white">
              Sent Campaigns & Drafts ({campaigns.length})
            </h2>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-2xl p-12 text-center text-zinc-500 text-sm">
              No campaigns scheduled. Use the form to write a new one.
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-750 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-zinc-200 text-sm">
                          {camp.name}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                            camp.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : camp.status === "SENDING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          {camp.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 text-[10px]">
                          {camp.channel}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          Segment: {camp.segment.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {camp.status === "DRAFT" && (
                        <SendCampaignButton campaignId={camp.id} />
                      )}
                      
                      <form
                        action={deleteCampaign.bind(null, camp.id)}
                      >
                        <button
                          type="submit"
                          className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-850 transition-all"
                          title="Delete Campaign"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Template text review */}
                  <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                      Template Copy
                    </span>
                    <p className="text-xs text-zinc-300 font-mono whitespace-pre-line leading-relaxed">
                      {camp.messageTemplate}
                    </p>
                  </div>

                  {/* Log summary if sent */}
                  {camp.status === "COMPLETED" && (
                    <div className="pt-3 border-t border-zinc-805 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-400">
                      <span>
                        Total Dispatched:{" "}
                        <strong className="text-zinc-200">
                          {camp.logs.length}
                        </strong>
                      </span>
                      <span>
                        Delivered:{" "}
                        <strong className="text-zinc-200">
                          {camp.logs.filter((l) => ["DELIVERED", "OPENED", "READ", "CLICKED"].includes(l.status)).length}
                        </strong>
                      </span>
                      <span>
                        Opened:{" "}
                        <strong className="text-zinc-200">
                          {camp.logs.filter((l) => ["OPENED", "READ", "CLICKED"].includes(l.status)).length}
                        </strong>
                      </span>
                      <span>
                        Clicks:{" "}
                        <strong className="text-zinc-200">
                          {camp.logs.filter((l) => l.status === "CLICKED").length}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
