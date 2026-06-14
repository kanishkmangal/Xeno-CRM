import { Suspense } from "react";
import { db } from "@/lib/db";
import CreateCustomerDialog from "./create-customer-dialog";
import CustomerFilters from "./customer-filters";
import CustomerSkeleton from "./customer-skeleton";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, CircleDollarSign, ChevronLeft, ChevronRight, Inbox, RefreshCw } from "lucide-react";

export const revalidate = 0;

interface PageSearchParams {
  q?: string;
  city?: string;
  spendOperator?: string;
  spendValue?: string;
  days?: string;
  page?: string;
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  // We serialize the search params to key the Suspense boundary.
  // Whenever the URL changes, Suspense will transition and show the Skeleton loader.
  const suspenseKey = JSON.stringify(resolvedSearchParams);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Customers
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Search shoppers, build dynamic targeting parameters, and check buyer history.
          </p>
        </div>
        <CreateCustomerDialog />
      </div>

      {/* Advanced search and filters controller */}
      <CustomerFilters />

      {/* Dynamic Data Table wrapped in Suspense */}
      <Suspense key={suspenseKey} fallback={<CustomerSkeleton />}>
        <CustomerTableData searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}

// Inner Server Component that fetches data based on search params
async function CustomerTableData({ searchParams }: { searchParams: PageSearchParams }) {
  const q = searchParams.q || "";
  const city = searchParams.city || "";
  const spendOperator = searchParams.spendOperator || "";
  const spendValue = searchParams.spendValue || "";
  const days = searchParams.days || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 10;

  const skip = (page - 1) * limit;

  // Build dynamic Prisma query filter
  const where: any = { AND: [] };

  // 1. Text Search matching name, email, or city
  if (q) {
    where.AND.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  // 2. City Filter
  if (city && city !== "ALL") {
    where.AND.push({ city: { equals: city, mode: "insensitive" } });
  }

  // 3. Total Spend combined filter
  if (spendOperator && spendValue) {
    const val = parseFloat(spendValue);
    if (!isNaN(val)) {
      if (spendOperator === "gt") {
        where.AND.push({ totalSpend: { gt: val } });
      } else if (spendOperator === "lt") {
        where.AND.push({ totalSpend: { lt: val } });
      } else if (spendOperator === "equals") {
        where.AND.push({ totalSpend: { equals: val } });
      }
    }
  }

  // 4. Last Order relative filter
  if (days) {
    const daysNum = parseInt(days);
    if (!isNaN(daysNum)) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysNum);
      where.AND.push({ lastOrderDate: { gte: cutoffDate } });
    }
  }

  if (where.AND.length === 0) {
    delete where.AND;
  }

  // Run queries inside parallel promise to optimize query times
  const [customers, totalCount] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    db.customer.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const startRow = totalCount === 0 ? 0 : skip + 1;
  const endRow = Math.min(skip + limit, totalCount);

  // Helper to build URL for page transitions retaining other filters
  const getPaginationUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val && key !== "page") {
        params.set(key, val);
      }
    });
    params.set("page", targetPage.toString());
    return `/dashboard/customers?${params.toString()}`;
  };

  // 7. Empty State check
  if (customers.length === 0) {
    return (
      <div className="bg-zinc-900/10 border border-zinc-800 border-dashed rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-zinc-900/60 border border-zinc-805 rounded-full text-zinc-500">
          <Inbox className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-zinc-350">
            No customers match your search criteria.
          </p>
          <p className="text-xs text-zinc-550 max-w-sm">
            Try adjusting your search keywords, total spend filters, location dropdowns, or active timeframes.
          </p>
        </div>
        <Link
          href="/dashboard/customers"
          className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 text-zinc-350 text-xs font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Clear Filters
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Customers Table */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
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
                      <span className="text-zinc-650 text-xs italic">
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
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
        <div className="text-xs text-zinc-400">
          Showing <span className="font-semibold text-white">{startRow}</span> to{" "}
          <span className="font-semibold text-white">{endRow}</span> of{" "}
          <span className="font-semibold text-white">{totalCount}</span> customers
        </div>

        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={getPaginationUrl(page - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-950 border border-zinc-900 text-zinc-600 text-xs font-semibold rounded-lg opacity-50 cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
          )}

          {page < totalPages ? (
            <Link
              href={getPaginationUrl(page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-950 border border-zinc-900 text-zinc-600 text-xs font-semibold rounded-lg opacity-50 cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
