import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditCustomerForm from "./edit-customer-form";
import {
  ChevronLeft,
  Calendar,
  CreditCard,
  History,
  User,
} from "lucide-react";

export const revalidate = 0;

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back button & Page title */}
      <div>
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Customers
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          {customer.name}
        </h1>
        <p className="text-zinc-500 text-xs mt-1">
          ID: {customer.id} • Created on{" "}
          {new Date(customer.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Grid Layout: Profile/Edit Card & Order History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Profile & Edit form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400 block font-medium">
                Lifetime Spend
              </span>
              <div className="flex items-center gap-2 mt-2">
                <CreditCard className="h-5 w-5 text-violet-400" />
                <span className="text-xl font-bold text-white">
                  ₹{customer.totalSpend.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400 block font-medium">
                Last Order Date
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold text-white">
                  {customer.lastOrderDate
                    ? new Date(customer.lastOrderDate).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
              <User className="h-5 w-5 text-violet-400" />
              <h2 className="text-md font-bold text-white">Profile Details</h2>
            </div>
            <EditCustomerForm customer={customer} />
          </div>
        </div>

        {/* Right Side: Order History */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
            <History className="h-5 w-5 text-emerald-400" />
            <h2 className="text-md font-bold text-white">Order History</h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {customer.orders.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm">
                No orders recorded.
              </div>
            ) : (
              customer.orders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 bg-zinc-950/50 border border-zinc-850 rounded-xl flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-zinc-500 truncate max-w-[120px]">
                      #{order.id}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-200">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      order.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : order.status === "PENDING"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
