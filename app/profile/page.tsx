import { prisma } from "@/lib/prisma";
import { CURRENT_USER_EMAIL } from "@/lib/constants";
import { ProfileSummaryCard } from "@/components/ProfileSummaryCard";
import { ActivityChip } from "@/components/ActivityChip";

export default async function ProfilePage() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: CURRENT_USER_EMAIL }, include: { profile: true, reliability: true, activityPrefs: { include: { activity: true } }, circleMembers: { include: { circle: true } }, events: { include: { event: true } } } });
  return <div className="space-y-4">
    <ProfileSummaryCard profile={user.profile} reliability={user.reliability} />
    <div className="rounded-2xl border border-zinc-800 bg-card p-4"><h3 className="font-semibold mb-2">Activities</h3><div className="flex flex-wrap gap-2">{user.activityPrefs.map((a)=><ActivityChip key={a.id} label={a.activity.name} />)}</div></div>
    <div className="rounded-2xl border border-zinc-800 bg-card p-4"><h3 className="font-semibold">Circles Joined</h3>{user.circleMembers.map((c)=><p key={c.id} className="text-sm text-zinc-300">{c.circle.name}</p>)}</div>
    <div className="rounded-2xl border border-zinc-800 bg-card p-4"><h3 className="font-semibold">Events Attended</h3>{user.events.map((e)=><p key={e.id} className="text-sm text-zinc-300">{e.event.title}</p>)}</div>
  </div>;
}
