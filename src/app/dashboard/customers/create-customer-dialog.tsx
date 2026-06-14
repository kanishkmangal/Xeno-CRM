"use client";

import { useState } from "react";
import { createCustomer } from "@/actions/customer-actions";
import { Plus, X, Loader2 } from "lucide-react";

export default function CreateCustomerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createCustomer(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
      // Reset form fields
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-violet-500/10"
      >
        <Plus className="h-4.5 w-4.5" />
        Add Customer
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white">New Customer</h3>
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
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">
                  Phone (Optional)
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="e.g. +919876543210"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">
                  City
                </label>
                <input
                  name="city"
                  type="text"
                  required
                  placeholder="e.g. Delhi"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
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
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
