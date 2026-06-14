"use client";

import { useState } from "react";
import { createSegment } from "@/actions/segment-actions";
import { Loader2, Sparkles, Layers, Plus } from "lucide-react";

export default function SegmentForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState("totalSpend");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createSegment(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      (e.target as HTMLFormElement).reset();
      // Reset defaults
      setSelectedField("totalSpend");
      // Trigger a page refresh
      window.location.reload();
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-violet-400" />
          Create Segment
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Define dynamic filters. Customers matching these rules are added to the segment automatically.
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 rounded-lg">
          Segment saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Segment Name
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. VIP Delhi Spenders"
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            placeholder="e.g. Customers in Delhi with lifetime spend exceeding 5,000 INR"
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
          />
        </div>

        {/* Rules */}
        <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-4">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Targeting Rule
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">
                Field
              </label>
              <select
                name="field"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="totalSpend">Total Spend (₹)</option>
                <option value="lastOrderDays">Last Order (Days ago)</option>
                <option value="city">City Location</option>
              </select>
            </div>

            {/* Operator */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">
                Operator
              </label>
              <select
                name="operator"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {selectedField === "city" ? (
                  <option value="equals">Equals</option>
                ) : (
                  <>
                    <option value="gt">Greater Than (&gt;)</option>
                    <option value="lt">Less Than (&lt;)</option>
                    <option value="equals">Equals (=)</option>
                  </>
                )}
              </select>
            </div>

            {/* Value */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">
                Value
              </label>
              <input
                name="value"
                type={selectedField === "city" ? "text" : "number"}
                required
                placeholder={
                  selectedField === "city"
                    ? "Delhi"
                    : selectedField === "totalSpend"
                    ? "5000"
                    : "60"
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors mt-4"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Create Dynamic Segment
        </button>
      </form>
    </div>
  );
}
