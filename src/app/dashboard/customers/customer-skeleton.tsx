import React from "react";

export default function CustomerSkeleton() {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-24"></div></th>
              <th className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-20"></div></th>
              <th className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-16"></div></th>
              <th className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-20"></div></th>
              <th className="py-4 px-6 text-right"><div className="h-4 bg-zinc-800 rounded w-12 ml-auto"></div></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {[...Array(5)].map((_, idx) => (
              <tr key={idx} className="border-b border-zinc-850/50">
                {/* Name & Contact */}
                <td className="py-5 px-6 space-y-2">
                  <div className="h-4 bg-zinc-850 rounded w-36"></div>
                  <div className="h-3 bg-zinc-850 rounded w-48"></div>
                </td>
                {/* Location */}
                <td className="py-5 px-6">
                  <div className="h-4 bg-zinc-855 rounded w-24"></div>
                </td>
                {/* Spend */}
                <td className="py-5 px-6">
                  <div className="h-4 bg-zinc-855 rounded w-20"></div>
                </td>
                {/* Last Order */}
                <td className="py-5 px-6">
                  <div className="h-4 bg-zinc-855 rounded w-28"></div>
                </td>
                {/* Actions */}
                <td className="py-5 px-6 text-right">
                  <div className="h-4 bg-zinc-850 rounded w-12 ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
