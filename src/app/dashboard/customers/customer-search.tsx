"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function CustomerSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") || "";

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const query = data.get("query") as string;
    
    if (query) {
      router.push(`/dashboard/customers?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/dashboard/customers");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-sm">
      <input
        name="query"
        type="text"
        defaultValue={currentQuery}
        placeholder="Search by name, email, city..."
        className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
      />
      <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-500" />
    </form>
  );
}
