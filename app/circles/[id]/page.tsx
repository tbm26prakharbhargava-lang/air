import { prisma } from "@/lib/prisma";
import { PrimaryButton } from "@/components/PrimaryButton";

export default async function CircleDetail({ params }: { params: { id: string } }) {
  const circle = await prisma.circle.findUniqueOrThrow({ where: { id: params.id }, include: { activity: true, members: { include: { user: { include: { profile: true } } } }, events: true } });
  return <div className="space-y-4">
    <p className="text-sm text-muted">{circle.activity.name} · {circle.locality}</p>
    <h1 className="text-3xl font-bold">{circle.name}</h1>
    <p>{circle.cadenceType} · {circle.timeBand}</p>
    <form action={`/api/circles/${circle.id}/join`} method="post"><PrimaryButton type="submit">Join Circle</PrimaryButton></form>
    <div><h3 className="font-semibold mb-2">Members</h3>{circle.members.slice(0,6).map((m)=><p key={m.id} className="text-sm text-zinc-300">{m.user.profile?.name}</p>)}</div>
    <div><h3 className="font-semibold mb-2">Upcoming events</h3>{circle.events.slice(0,5).map((e)=><p key={e.id} className="text-sm text-zinc-300">{e.title}</p>)}</div>
  </div>;
}
