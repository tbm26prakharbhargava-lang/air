import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CURRENT_USER_EMAIL } from "@/lib/constants";
import { recomputeForUser } from "@/services/matching";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: CURRENT_USER_EMAIL } });
  await prisma.circleMember.upsert({ where: { circleId_userId: { circleId: params.id, userId: user.id } }, update: { membershipStatus: "ACTIVE" }, create: { circleId: params.id, userId: user.id, membershipStatus: "ACTIVE" } });
  await recomputeForUser(user.id);
  return NextResponse.redirect(new URL(`/circles/${params.id}`, req.url));
}
