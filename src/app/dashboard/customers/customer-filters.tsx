"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, RotateCcw, MapPin, CreditCard, Calendar } from "lucide-react";

export default function CustomerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Collapsible panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Filter local states initialized from URL parameters
  const [searchVal, setSearchVal] = useState(searchParams.get("q") || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "");
  const [spendOperator, setSpendOperator] = useState(searchParams.get("spendOperator") || "gt");
  const [spendValue, setSpendValue] = useState(searchParams.get("spendValue") || "");
  const [daysCutoff, setDaysCutoff] = useState(searchParams.get("days") || "");

  // Tracks if initial mount has occurred to avoid triggering search on load
  const isFirstMount = useRef(true);

  // Synchronize state when URL changes (e.g. back/forward navigation or clear filters)
  useEffect(() => {
    setSearchVal(searchParams.get("q") || "");
    setSelectedCity(searchParams.get("city") || "");
    setSpendOperator(searchParams.get("spendOperator") || "gt");
    setSpendValue(searchParams.get("spendValue") || "");
    setDaysCutoff(searchParams.get("days") || "");
  }, [searchParams]);

  // Combined function to build query parameters
  const getQueryString = (updatedParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Always reset page index back to 1 when filters are changed
    params.set("page", "1");

    Object.entries(updatedParams).forEach(([key, val]) => {
      if (val === null || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    return params.toString();
  };

  // Debounced Search query sync
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const delayDebounce = setTimeout(() => {
      const query = getQueryString({ q: searchVal });
      router.push(`${pathname}?${query}`);
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchVal]);

  // Synchronize filters instantly when updated
  const handleFilterChange = (updates: Record<string, string | null>) => {
    const query = getQueryString(updates);
    router.push(`${pathname}?${query}`);
  };

  // Reset all filters to default
  const handleClearFilters = () => {
    setSearchVal("");
    setSelectedCity("");
    setSpendOperator("gt");
    setSpendValue("");
    setDaysCutoff("");

    // Push clean URL
    router.push(pathname);
  };

  // Compute number of active filters to show badge count
  const activeFiltersCount = [
    selectedCity,
    spendValue ? spendValue : null,
    daysCutoff,
  ].filter(Boolean).length;

  const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Pune", "Kolkata"];

  return (
    <div className="space-y-4">
      {/* Top search & filter buttons row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by name, email, or city..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
          />
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500" />
        </div>

        <div className="flex gap-2">
          {/* Toggle Panel Button */}
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-all ${
              isPanelOpen || activeFiltersCount > 0
                ? "bg-violet-600/10 border-violet-500/35 text-violet-400"
                : "bg-zinc-900 border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700/80 text-zinc-300"
            }`}
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Reset Filters Shortcut (Visible if any filters are active) */}
          {(activeFiltersCount > 0 || searchVal) && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-805 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Collapsible Filter Drawer */}
      {isPanelOpen && (
        <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl animate-in slide-in-from-top duration-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* A. Location Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
              Location
            </label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                handleFilterChange({ city: e.target.value });
              }}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* B. Total Spend Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-zinc-500" />
              Total Spend (₹)
            </label>
            <div className="flex gap-2">
              <select
                value={spendOperator}
                onChange={(e) => {
                  setSpendOperator(e.target.value);
                  if (spendValue) {
                    handleFilterChange({ spendOperator: e.target.value });
                  }
                }}
                className="w-24 px-2 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="gt">Spend &gt;</option>
                <option value="lt">Spend &lt;</option>
                <option value="equals">Spend =</option>
              </select>
              <input
                type="number"
                value={spendValue}
                onChange={(e) => {
                  setSpendValue(e.target.value);
                  handleFilterChange({ spendValue: e.target.value, spendOperator });
                }}
                placeholder="Value..."
                className="flex-1 min-w-0 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* C. Last Order relative filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              Last Order Period
            </label>
            <select
              value={daysCutoff}
              onChange={(e) => {
                setDaysCutoff(e.target.value);
                handleFilterChange({ days: e.target.value });
              }}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">Any Timeframe</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="60">Last 60 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last 1 Year</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
