import { cn } from "@/lib/utils";

type ChipTone = "default" | "yellow" | "green";

export function Chip({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: ChipTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        tone === "default" && "border-white/10 bg-white/5 text-zinc-200",
        tone === "yellow" && "border-yellow-500/30 bg-yellow-500/15 text-yellow-200",
        tone === "green" && "border-emerald-500/30 bg-emerald-500/15 text-emerald-200",
        className,
      )}
    >
      {children}
    </span>
  );
}
