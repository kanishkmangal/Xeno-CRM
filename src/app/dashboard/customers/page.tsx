import { db } from "@/lib/db";
import CreateCustomerDialog from "./create-customer-dialog";
import CustomerSearch from "./customer-search";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, CircleDollarSign } from "lucide-react";

export const revalidate = 0;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q || "";

  // Query customers matching search filter
  const customers = await db.customer.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Customers
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your customer database, review lifetime spends, and view activity.
          </p>
        </div>
        <CreateCustomerDialog />
      </div>

      {/* Search Bar & Total Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
        <CustomerSearch />
        <div className="text-sm text-zinc-400">
          Showing <span className="font-semibold text-white">{customers.length}</span> customers
        </div>
      </div>

      {/* Customers List / Table */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-sm">
            {q ? `No customers match search term "${q}"` : "No customers stored yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 font-medium text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Total Spend</th>
                  <th className="py-4 px-6">Last Order</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-zinc-900/30 transition-colors"
                  >
                    {/* Name & Contact Info */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-zinc-200">
                        {customer.name}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5 space-y-0.5">
                        <p>{customer.email}</p>
                        {customer.phone && <p>{customer.phone}</p>}
                      </div>
                    </td>

                    {/* City Location */}
                    <td className="py-4 px-6 text-zinc-300">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <MapPin className="h-4 w-4 text-zinc-500" />
                        <span>{customer.city}</span>
                      </div>
                    </td>

                    {/* Total Spend */}
                    <td className="py-4 px-6 font-mono text-zinc-300">
                      <div className="flex items-center gap-1">
                        <CircleDollarSign className="h-4 w-4 text-zinc-500" />
                        <span>₹{customer.totalSpend.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Last Order Date */}
                    <td className="py-4 px-6 text-zinc-400">
                      {customer.lastOrderDate ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-zinc-500" />
                          <span>
                            {new Date(customer.lastOrderDate).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-xs italic">
                          Never ordered
                        </span>
                      )}
                    </td>

                    {/* View Details Link */}
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
