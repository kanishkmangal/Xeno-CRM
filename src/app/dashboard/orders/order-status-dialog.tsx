"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/actions/order-actions";
import { X, Loader2, ArrowRight } from "lucide-react";

export default function OrderStatusDialog({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Compute allowed next statuses based on rules
  const getAllowedStatuses = () => {
    switch (currentStatus) {
      case "PENDING":
        return ["COMPLETED", "CANCELLED", "REFUNDED"];
      case "COMPLETED":
        return ["CANCELLED", "REFUNDED"];
      case "CANCELLED":
        return ["REFUNDED"];
      default:
        return [];
    }
  };

  const allowedStatuses = getAllowedStatuses();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get("status") as string;

    const res = await updateOrderStatus(orderId, newStatus);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
    }
  };

  if (currentStatus === "REFUNDED") {
    return (
      <button
        disabled
        title="REFUNDED is a final state"
        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-800"
      >
        Final State
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-violet-600 hover:bg-violet-700 text-white transition-colors"
      >
        Update Status
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white">Update Order Status</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-mono p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-zinc-400">Order ID:</span>
                <span className="text-white truncate">#{orderId}</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 mb-1">Current</span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {currentStatus}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600" />
                <div className="flex-1 flex flex-col">
                  <span className="text-xs text-zinc-500 mb-1">New Status</span>
                  <select
                    name="status"
                    required
                    className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    {allowedStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-sm text-zinc-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
