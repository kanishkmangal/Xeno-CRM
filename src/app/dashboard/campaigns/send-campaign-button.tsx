"use client";

import { useState } from "react";
import { sendCampaign } from "@/actions/campaign-actions";
import { Send, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SendCampaignButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!confirm("Are you sure you want to send this campaign? This will simulate real-time deliveries and progressive webhook callbacks.")) {
      return;
    }

    setSending(true);
    const res = await sendCampaign(campaignId);

    if (res?.error) {
      alert(res.error);
      setSending(false);
    } else {
      setSending(false);
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={sending}
      className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-750 text-white rounded-lg text-xs font-semibold shadow-md shadow-violet-500/10 transition-colors disabled:opacity-50"
    >
      {sending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="h-3.5 w-3.5" />
          Send Campaign
        </>
      )}
    </button>
  );
}
