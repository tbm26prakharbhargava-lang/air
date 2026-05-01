import { prisma } from "@/lib/prisma";
import { PrimaryButton } from "@/components/PrimaryButton";

export default async function EventDetail({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUniqueOrThrow({ where: { id: params.id }, include: { participants: true, circle: true } });
  return <div className="space-y-4">
    <h1 className="text-3xl font-bold">{event.title}</h1>
    <p className="text-zinc-300">{new Date(event.startTime).toLocaleString()} · {event.locationName}</p>
    <p className="text-zinc-300">Participants: {event.participants.length}/{event.capacity}</p>
    <form action={`/api/events/${event.id}/rsvp`} method="post"><PrimaryButton type="submit" className="bg-success text-white">RSVP Going</PrimaryButton></form>
  </div>;
}
