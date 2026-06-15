export default function OrderSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Search and filter top bar skeleton */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 font-medium text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="py-4 px-6">
                    <div className="h-4 bg-zinc-800 rounded w-16"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-zinc-800 rounded w-32"></div>
                      <div className="h-3 bg-zinc-800 rounded w-48"></div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 bg-zinc-800 rounded w-20"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-6 bg-zinc-800 rounded-full w-24"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 bg-zinc-800 rounded w-28"></div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="h-8 bg-zinc-800 rounded w-24 ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
