import LoginForm from "./login-form";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 p-4 overflow-hidden">
      {/* Background gradients for premium aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.1),transparent_50%)]" />
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.08),transparent_50%)]" />

      <div className="relative w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-400 mb-2">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-sm text-zinc-400">
            Sign in to access your Shopper CRM and campaign hub
          </p>
        </div>

        {/* Glassmorphism Card container */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-8 rounded-2xl shadow-2xl space-y-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
