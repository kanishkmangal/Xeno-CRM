import { Suspense } from "react";
import { db } from "@/lib/db";
import CreateOrderDialog from "./create-order-dialog";
import OrderFilters from "./order-filters";
import OrderStatusDialog from "./order-status-dialog";
import OrderSkeleton from "./order-skeleton";
import { CreditCard, Calendar, User, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const suspenseKey = JSON.stringify(resolvedParams);

  // Fetch customers for the create order dropdown, this doesn't depend on search
  const customers = await db.customer.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Orders
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Browse through transactional purchases, record checkout records, and monitor buyer values.
          </p>
        </div>
        <CreateOrderDialog customers={customers} />
      </div>

      <OrderFilters />

      <Suspense key={suspenseKey} fallback={<OrderSkeleton />}>
        <OrderTableData searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}

async function OrderTableData({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const q = searchParams.q || "";
  const status = searchParams.status || "";
  const min = searchParams.min ? parseFloat(searchParams.min) : undefined;
  const max = searchParams.max ? parseFloat(searchParams.max) : undefined;

  // Build prisma where clause
  const whereClause: any = {};
  
  if (q) {
    whereClause.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { customer: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (status) {
    whereClause.status = status;
  }

  if (min !== undefined || max !== undefined) {
    whereClause.totalAmount = {};
    if (min !== undefined) whereClause.totalAmount.gte = min;
    if (max !== undefined) whereClause.totalAmount.lte = max;
  }

  const [orders, totalOrdersCount] = await Promise.all([
    db.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    db.order.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalOrdersCount / pageSize) || 1;

  // Helper to build pagination links while preserving other filters
  const buildPageLink = (newPage: number) => {
    const params = new URLSearchParams(searchParams as any);
    params.set("page", newPage.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
      {orders.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 text-sm flex flex-col items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-zinc-600" />
          <p>No orders match the selected criteria.</p>
          <Link 
            href="/dashboard/orders" 
            className="mt-2 text-violet-400 hover:text-violet-300 font-medium text-xs"
          >
            Clear Filters
          </Link>
        </div>
      ) : (
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
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-zinc-900/30 transition-colors"
                >
                  {/* Order ID */}
                  <td className="py-4 px-6 font-mono text-xs text-zinc-500">
                    #{order.id}
                  </td>

                  {/* Customer Info */}
                  <td className="py-4 px-6">
                    <div className="font-semibold text-zinc-200">
                      {order.customer.name}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {order.customer.email}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-6 font-mono text-zinc-300 font-semibold">
                    ₹{order.totalAmount.toLocaleString()}
                  </td>

                  {/* Status badge */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        order.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : order.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6 text-zinc-400">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-4 w-4 text-zinc-500" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <OrderStatusDialog orderId={order.id} currentStatus={order.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalOrdersCount > 0 && (
        <div className="border-t border-zinc-800 bg-zinc-900/30 p-4 flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-medium">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalOrdersCount)} of {totalOrdersCount} entries
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={buildPageLink(Math.max(1, page - 1))}
              className={`p-1.5 rounded-lg border border-zinc-800 flex items-center justify-center transition-colors ${
                page <= 1 ? "opacity-50 cursor-not-allowed pointer-events-none bg-zinc-900/50" : "hover:bg-zinc-800 bg-zinc-900 text-zinc-300"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="text-xs text-zinc-400 font-medium px-2">
              Page {page} of {totalPages}
            </span>
            <Link
              href={buildPageLink(Math.min(totalPages, page + 1))}
              className={`p-1.5 rounded-lg border border-zinc-800 flex items-center justify-center transition-colors ${
                page >= totalPages ? "opacity-50 cursor-not-allowed pointer-events-none bg-zinc-900/50" : "hover:bg-zinc-800 bg-zinc-900 text-zinc-300"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
