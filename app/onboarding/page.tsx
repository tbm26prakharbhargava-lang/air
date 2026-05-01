import { prisma } from "@/lib/prisma";
import { CURRENT_USER_EMAIL } from "@/lib/constants";
import { PrimaryButton } from "@/components/PrimaryButton";

export default async function OnboardingPage() {
  const activities = await prisma.activity.findMany({ orderBy: { name: "asc" } });
  const user = await prisma.user.findUnique({ where: { email: CURRENT_USER_EMAIL }, include: { profile: true } });
  return <form action="/api/onboarding" method="post" className="space-y-4">
    <h1 className="text-3xl font-bold">Onboarding</h1>
    <input name="city" defaultValue={user?.profile?.city || "Gurgaon"} className="w-full rounded-xl bg-card border border-zinc-700 p-3" placeholder="City" />
    <input name="locality" defaultValue={user?.profile?.locality || "DLF Phase 2"} className="w-full rounded-xl bg-card border border-zinc-700 p-3" placeholder="Locality" />
    <input name="radius" type="number" defaultValue={8} className="w-full rounded-xl bg-card border border-zinc-700 p-3" placeholder="Radius km" />
    <select name="intent" className="w-full rounded-xl bg-card border border-zinc-700 p-3"><option>SPORTS</option><option>CORPORATE</option><option>CREATORS</option></select>
    <div><p className="mb-2">Activities</p><div className="grid grid-cols-2 gap-2">{activities.map((a)=><label key={a.id} className="text-sm"><input type="checkbox" name="activities" value={a.id} defaultChecked className="mr-2"/>{a.name}</label>)}</div></div>
    <div><p>Time preferences</p><label><input type="checkbox" name="times" value="MORNINGS" className="mr-2"/>Mornings</label><label className="ml-3"><input type="checkbox" name="times" value="EVENINGS" className="mr-2" defaultChecked/>Evenings</label><label className="ml-3"><input type="checkbox" name="times" value="WEEKENDS" className="mr-2" defaultChecked/>Weekends</label></div>
    <div className="space-y-2"><p>Behavior sliders (0-1)</p><input name="seriousness" step="0.1" type="number" defaultValue={0.6} className="w-full rounded-xl bg-card border border-zinc-700 p-2" /><input name="planningStyle" step="0.1" type="number" defaultValue={0.5} className="w-full rounded-xl bg-card border border-zinc-700 p-2" /><input name="groupPreference" step="0.1" type="number" defaultValue={0.4} className="w-full rounded-xl bg-card border border-zinc-700 p-2" /><input name="routinePreference" step="0.1" type="number" defaultValue={0.8} className="w-full rounded-xl bg-card border border-zinc-700 p-2" /></div>
    <PrimaryButton type="submit">Save & Recompute Recommendations</PrimaryButton>
  </form>;
}
