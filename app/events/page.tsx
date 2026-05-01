import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/EventCard";
import { SectionHeader } from "@/components/SectionHeader";

export default async function EventsPage() {
  const events = await prisma.event.findMany({ where: { status: "SCHEDULED" }, orderBy: { startTime: "asc" } });
  return <div><SectionHeader title="Events" subtitle="RSVP and show up consistently" /><div className="space-y-3">{events.map((e) => <EventCard key={e.id} event={e} />)}</div></div>;
}
