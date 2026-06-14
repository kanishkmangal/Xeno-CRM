"use client";

import { useState } from "react";
import { createCampaign, generateAITemplate } from "@/actions/campaign-actions";
import { Send, Loader2, Sparkles, Plus } from "lucide-react";

interface Segment {
  id: string;
  name: string;
}

export default function CampaignForm({ segments }: { segments: Segment[] }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // AI Generation states
  const [generatingAI, setGeneratingAI] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("EMAIL");
  const [aiInstructions, setAiInstructions] = useState("");
  const [templateText, setTemplateText] = useState("");

  const handleGenerateAI = async () => {
    if (!selectedSegment) {
      setError("Please select a segment first to generate AI copy.");
      return;
    }

    setError(null);
    setGeneratingAI(true);

    const res = await generateAITemplate(selectedSegment, selectedChannel, aiInstructions);

    if (res?.error) {
      setError(res.error);
    } else if (res?.text) {
      setTemplateText(res.text);
    }
    setGeneratingAI(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // Overwrite templateText
    formData.set("messageTemplate", templateText);
    const res = await createCampaign(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      (e.target as HTMLFormElement).reset();
      setTemplateText("");
      setAiInstructions("");
      // Refresh list
      window.location.reload();
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Send className="h-5 w-5 text-violet-400" />
          Create Campaign
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Compose message campaigns, select delivery routes, and leverage AI copy generation.
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 rounded-lg">
          Campaign draft created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Campaign Name
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. Summer Clearance Launch"
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
          />
        </div>

        {/* Segment Selection */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Target Segment
          </label>
          <select
            name="segmentId"
            required
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="" disabled>
              -- Select Target Audience --
            </option>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Channel Selection */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Channel
          </label>
          <select
            name="channel"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="EMAIL">EMAIL</option>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WHATSAPP</option>
          </select>
        </div>

        {/* AI Generator Helper Box */}
        <div className="p-4 bg-violet-950/20 border border-violet-900/30 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-violet-400">
            <Sparkles className="h-4 w-4" />
            AI Writer Assistant
          </div>

          <input
            type="text"
            value={aiInstructions}
            onChange={(e) => setAiInstructions(e.target.value)}
            placeholder="AI Prompt (e.g. Include coupon code 'SAVE20', keep it friendly)"
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800/80 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />

          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={generatingAI}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {generatingAI ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Drafting layout...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate Copy with Gemini
              </>
            )}
          </button>
        </div>

        {/* Message Template Text */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Message Template
          </label>
          <textarea
            name="messageTemplate"
            rows={4}
            required
            value={templateText}
            onChange={(e) => setTemplateText(e.target.value)}
            placeholder="Type your template copy here... Use {name}, {totalSpend}, or {city} as placeholders."
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
          />
          <span className="text-[10px] text-zinc-500 block">
            Supports merge tags: <code className="text-zinc-400 font-mono">&#123;name&#125;</code>, <code className="text-zinc-400 font-mono">&#123;totalSpend&#125;</code>, <code className="text-zinc-400 font-mono">&#123;city&#125;</code>
          </span>
        </div>

        <button
          type="submit"
          disabled={loading || generatingAI}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors mt-6"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Create Campaign Draft
        </button>
      </form>
    </div>
  );
}
