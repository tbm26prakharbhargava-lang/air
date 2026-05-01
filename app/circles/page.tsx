import { prisma } from "@/lib/prisma";
import { CircleCard } from "@/components/CircleCard";
import { SectionHeader } from "@/components/SectionHeader";

export default async function CirclesPage() {
  const circles = await prisma.circle.findMany({ include: { activity: true }, orderBy: { name: "asc" } });
  return <div><SectionHeader title="Circles" subtitle="Small groups built for repeat participation" /><div className="space-y-3">{circles.map((c) => <CircleCard key={c.id} circle={c} />)}</div></div>;
}
