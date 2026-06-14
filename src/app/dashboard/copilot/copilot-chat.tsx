"use client";

import { useState } from "react";
import { processCopilotPrompt } from "@/actions/copilot-actions";
import SendCampaignButton from "../campaigns/send-campaign-button";
import { Sparkles, Loader2, Users, Mail, MessageSquare, AlertCircle } from "lucide-react";

export default function CopilotChat() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    segmentId: string;
    campaignId: string;
    segmentName: string;
    campaignName: string;
    channel: string;
    matchedCount: number;
    messageTemplate: string;
  } | null>(null);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const res = await processCopilotPrompt(prompt);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else if (res?.success) {
      setResult(res as any);
      setLoading(false);
    }
  };

  const examplePrompts = [
    "Bring back customers who haven't ordered in 60 days",
    "Target big spenders with total spend over 5000 in Delhi",
    "Send a discount code to new signups with zero spend",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Prompt Panel */}
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <h2 className="text-md font-bold text-white">Ask Copilot</h2>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Instruct the marketing agent in plain text. Copilot will automatically structure segment conditions, query the matching audience size, pick a delivery route, and write a targeted message template copy.
          </p>

          <form onSubmit={handlePromptSubmit} className="space-y-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your marketing goal..."
              rows={4}
              required
              disabled={loading}
              className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:opacity-95 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-violet-500/10"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Analyzing Segment & Copy...
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5" />
                  Analyze and Build Campaign
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="bg-zinc-900/30 border border-zinc-805 rounded-xl p-5 space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Suggested commands
          </span>
          <div className="space-y-2">
            {examplePrompts.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                disabled={loading}
                className="w-full text-left p-2.5 bg-zinc-950/40 hover:bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-zinc-300 transition-colors"
              >
                &quot;{ex}&quot;
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Display Pane */}
      <div className="lg:col-span-3">
        {loading && (
          <div className="h-full min-h-[350px] bg-zinc-900/20 border border-zinc-800 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 space-y-4 text-center">
            <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-300">
                AI Agent is reasoning...
              </p>
              <p className="text-xs text-zinc-500 max-w-xs">
                Generating Dynamic database filter conditions and generating targeted copywriting template in background.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="h-full min-h-[350px] bg-zinc-900/20 border border-red-950/20 rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-red-400 font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && !result && (
          <div className="h-full min-h-[350px] bg-zinc-900/10 border border-zinc-800 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <Sparkles className="h-8 w-8 text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-400 font-medium">
              Awaiting instruction...
            </p>
            <p className="text-xs text-zinc-500 max-w-xs mt-1">
              Type or select a marketing instruction on the left to see dynamic copilot generation.
            </p>
          </div>
        )}

        {!loading && !error && result && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Top Info Banner */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-violet-400 bg-violet-500/10 border border-violet-500/25 px-2 py-0.5 rounded-md">
                  AI Recommendation Generated
                </span>
                <h3 className="text-lg font-extrabold text-white mt-2">
                  {result.campaignName}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Dynamic Segment Created: <span className="text-zinc-200 font-semibold">{result.segmentName}</span>
                </p>
              </div>

              {/* Match and channel pill */}
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs">
                  <Users className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-zinc-300 font-semibold">{result.matchedCount} Match</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs">
                  {result.channel === "EMAIL" ? (
                    <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  ) : (
                    <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
                  )}
                  <span className="text-zinc-300 font-semibold">{result.channel}</span>
                </div>
              </div>
            </div>

            {/* Template Mockup Card */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-400 block">
                Suggested Copy Draft
              </span>
              <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 font-mono text-xs text-zinc-300 whitespace-pre-line leading-relaxed relative">
                {result.messageTemplate}
              </div>
            </div>

            {/* Direct Action Dispatches */}
            <div className="flex items-center justify-between border-t border-zinc-800 pt-4 mt-6">
              <span className="text-xs text-zinc-500 leading-relaxed max-w-xs">
                The segment and campaign draft have been saved in the CRM. You can send it directly from here.
              </span>
              <SendCampaignButton campaignId={result.campaignId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
