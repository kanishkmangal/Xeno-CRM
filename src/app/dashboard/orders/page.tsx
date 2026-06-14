import { db } from "@/lib/db";
import CreateOrderDialog from "./create-order-dialog";
import { CreditCard, Calendar, User, ShieldAlert } from "lucide-react";

export const revalidate = 0;

export default async function OrdersPage() {
  // Fetch all orders with customer metadata
  const orders = await db.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Fetch all customers for the creation dropdown selector
  const customers = await db.customer.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
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

      {/* Orders Table */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-sm">
            No orders recorded in the CRM. Use &quot;New Order&quot; to register a purchase.
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
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : order.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
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
