import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

export function Hero() {
  return (
    <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,196,0,0.18),_transparent_32%),linear-gradient(180deg,rgba(26,28,33,0.95),rgba(11,11,13,0.98))] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.35)] lg:grid-cols-[1.35fr_0.95fr] lg:p-10">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Chip tone="yellow">AI-native community OS</Chip>
          <Chip tone="green">Location-first</Chip>
          <Chip>Built for repeat participation</Chip>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-400">
            Circles
          </p>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find your people nearby. Build routines that actually stick.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-300">
            Circles matches users into small trusted groups around activities,
            schedule fit, behavior, and preferences. Agents moderate groups,
            run surveys, and keep communities healthy between events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">
            Explore your feed
            <ArrowRight className="size-4" />
          </Button>
          <Button variant="secondary" size="lg">
            View matching engine
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-yellow-300">
            <Sparkles className="size-4" />
            AI summary
          </div>
          <p className="text-sm leading-7 text-zinc-300">
            You look like a structured evening-sports user who prefers small
            groups, reliable attendance, and thoughtful people nearby.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/8 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
            Recommended this week
          </p>
          <div className="mt-2 space-y-2">
            <p className="text-lg font-semibold text-white">
              Gurgaon PM Badminton Circle
            </p>
            <p className="text-sm text-zinc-300">
              Wed 7 PM • Sector 56 • 8 people likely to attend
            </p>
            <div className="flex flex-wrap gap-2">
              <Chip tone="green">High attendance</Chip>
              <Chip>Professional peers</Chip>
              <Chip>Evening fit</Chip>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Weekly rituals" value="12" />
          <MetricCard label="Healthy circles" value="81%" />
          <MetricCard label="No-show reduction" value="-24%" />
          <MetricCard label="Matched via context" value="100%" />
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
