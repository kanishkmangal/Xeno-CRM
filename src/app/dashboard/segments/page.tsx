import { db } from "@/lib/db";
import SegmentForm from "./segment-form";
import { getCustomersMatchingSegment } from "@/lib/segment-evaluator";
import { Layers, Users, Trash2 } from "lucide-react";
import { deleteSegment } from "@/actions/segment-actions";

export const revalidate = 0;

// Helper to format criteria conditions to human text
function formatCondition(condition: any) {
  const fieldNames: any = {
    totalSpend: "Total Spend",
    lastOrderDays: "Days Since Last Order",
    city: "City Location",
  };

  const operators: any = {
    gt: ">",
    lt: "<",
    equals: "=",
  };

  const field = fieldNames[condition.field] || condition.field;
  const operator = operators[condition.operator] || condition.operator;
  const value = condition.field === "totalSpend" ? `₹${condition.value}` : condition.value;

  return `${field} ${operator} ${value}`;
}

export default async function SegmentsPage() {
  const segments = await db.segment.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate live matched customer size for each segment
  const segmentsWithCounts = await Promise.all(
    segments.map(async (segment) => {
      const matches = await getCustomersMatchingSegment(segment.criteria);
      return {
        ...segment,
        count: matches.length,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Segments
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Group your customer audience dynamically using filters. Create messaging pools.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left pane: Builder form */}
        <div className="lg:col-span-1">
          <SegmentForm />
        </div>

        {/* Right pane: Saved segments list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
            <h2 className="text-sm font-bold text-white">
              Dynamic Segments ({segmentsWithCounts.length})
            </h2>
          </div>

          {segmentsWithCounts.length === 0 ? (
            <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-2xl p-12 text-center text-zinc-500 text-sm">
              No segments created. Use the segment builder to target customers.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {segmentsWithCounts.map((seg) => (
                <div
                  key={seg.id}
                  className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-750 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-zinc-200 text-sm">
                          {seg.name}
                        </h3>
                        {seg.description && (
                          <p className="text-xs text-zinc-500 mt-1">
                            {seg.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Criteria tag */}
                    <div className="p-2.5 bg-zinc-950/80 border border-zinc-850 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                        Criteria rule
                      </span>
                      <code className="text-xs font-mono text-violet-300">
                        {seg.criteria && (seg.criteria as any).conditions
                          ? (seg.criteria as any).conditions.map((c: any, idx: number) => (
                              <span key={idx}>{formatCondition(c)}</span>
                            ))
                          : "None"}
                      </code>
                    </div>
                  </div>

                  {/* Footer audience metrics */}
                  <div className="flex items-center justify-between border-t border-zinc-805 pt-4 mt-5">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Users className="h-4 w-4 text-zinc-500" />
                      <span>
                        Audience: <strong className="text-zinc-200">{seg.count}</strong> matches
                      </span>
                    </div>

                    <form
                      action={deleteSegment.bind(null, seg.id)}
                    >
                      <button
                        type="submit"
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-850 transition-all"
                        title="Delete Segment"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
