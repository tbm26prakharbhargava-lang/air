import Link from "next/link";

export function EventCard({ event }: { event: any }) {
  return (
    <Link href={`/events/${event.id}`} className="block rounded-2xl border border-zinc-800 bg-card p-4">
      <p className="text-xs text-muted">{new Date(event.startTime).toLocaleString()}</p>
      <p className="text-lg font-semibold mt-1">{event.title}</p>
      <p className="text-sm text-zinc-300">{event.locationName}</p>
    </Link>
  );
}
