import { NextResponse } from "next/server";
import { z } from "zod";

import { runModeratorAgent } from "@/lib/agents/moderator";

const requestSchema = z.object({
  circleId: z.string().optional(),
  circleName: z.string().optional(),
  city: z.string().optional(),
  goal: z.string(),
  conversation: z.array(z.string()).default([]),
  webFindings: z.array(z.string()).default([]),
  attendanceRate: z.number().min(0).max(1),
  recentConcerns: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid moderator request payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const response = runModeratorAgent({
    message: [
      parsed.data.goal,
      ...parsed.data.conversation,
      ...parsed.data.recentConcerns,
      ...parsed.data.webFindings,
    ]
      .filter(Boolean)
      .join(" "),
    circleName: parsed.data.circleName ?? parsed.data.circleId ?? "Active Circle",
    city: parsed.data.city,
  });

  return NextResponse.json(response);
}
