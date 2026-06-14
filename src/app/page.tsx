import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-950 text-white">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
          AI-Native Shopper CRM
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl">
          Build automated hyper-targeted shopper campaigns, segment clients with AI, and track campaign deliveries dynamically.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all shadow-lg shadow-violet-500/20"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
