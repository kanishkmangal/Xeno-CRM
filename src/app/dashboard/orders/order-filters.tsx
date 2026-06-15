"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, X, Filter } from "lucide-react";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [minAmount, setMinAmount] = useState(searchParams.get("min") || "");
  const [maxAmount, setMaxAmount] = useState(searchParams.get("max") || "");
  
  const debouncedSearch = useDebounce(search, 300);

  // Sync debounced search to URL
  useEffect(() => {
    updateFilters({ q: debouncedSearch });
  }, [debouncedSearch]);

  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Always reset to page 1 when filtering
    if (Object.keys(newParams).length > 0 && !newParams.page) {
      params.set("page", "1");
    }

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setMinAmount("");
    setMaxAmount("");
    startTransition(() => {
      router.push("/dashboard/orders");
    });
  };

  const hasActiveFilters = search || status || minAmount || maxAmount;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by customer name or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
          />
        </div>
        
        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors sm:w-auto w-full"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        {/* Status */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              updateFilters({ status: e.target.value });
            }}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        {/* Min Amount */}
        <div className="flex-1 min-w-[120px]">
          <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Min Amount (₹)</label>
          <input
            type="number"
            placeholder="0"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            onBlur={() => updateFilters({ min: minAmount })}
            onKeyDown={(e) => e.key === "Enter" && updateFilters({ min: minAmount })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>

        {/* Max Amount */}
        <div className="flex-1 min-w-[120px]">
          <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Max Amount (₹)</label>
          <input
            type="number"
            placeholder="Any"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            onBlur={() => updateFilters({ max: maxAmount })}
            onKeyDown={(e) => e.key === "Enter" && updateFilters({ max: maxAmount })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>
      </div>
    </div>
  );
}
