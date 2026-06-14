import CopilotChat from "./copilot-chat";

export const revalidate = 0;

export default function CopilotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          AI Copilot
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Instruct the AI assistant to instantly construct target user pools and write campaign messaging templates.
        </p>
      </div>

      <CopilotChat />
    </div>
  );
}
