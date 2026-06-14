"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCustomer, deleteCustomer } from "@/actions/customer-actions";
import { Loader2, Save, Trash2 } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string;
}

export default function EditCustomerForm({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateCustomer(customer.id, formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${customer.name}? This will also delete their order history.`
      )
    ) {
      return;
    }

    setError(null);
    setDeleting(true);

    const res = await deleteCustomer(customer.id);

    if (res?.error) {
      setError(res.error);
      setDeleting(false);
    } else {
      router.push("/dashboard/customers");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 rounded-lg">
          Customer profile updated successfully!
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={customer.name}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              defaultValue={customer.email}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">
              Phone
            </label>
            <input
              name="phone"
              type="tel"
              defaultValue={customer.phone || ""}
              placeholder="No phone number"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">
              City
            </label>
            <input
              name="city"
              type="text"
              required
              defaultValue={customer.city}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-800 justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || loading}
            className="flex items-center justify-center gap-1.5 px-4 py-2 border border-red-900/50 hover:bg-red-950/20 text-red-400 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete Customer
          </button>

          <button
            type="submit"
            disabled={loading || deleting}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
