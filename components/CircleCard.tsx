import Link from "next/link";

export function CircleCard({ circle }: { circle: any }) {
  return (
    <Link href={`/circles/${circle.id}`} className="block rounded-2xl border border-zinc-800 bg-card p-4">
      <p className="text-xs text-muted">{circle.activity.name} · {circle.locality}</p>
      <p className="text-lg font-semibold mt-1">{circle.name}</p>
      <p className="text-sm text-zinc-300 mt-1">{circle.cadenceType} · {circle.timeBand}</p>
    </Link>
  );
}
