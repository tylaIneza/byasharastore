import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { teamMemberSchema } from "@/lib/validators/auth";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const team = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: team });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = teamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 409 });
    }

    const user = await prisma.user.create({ data: parsed.data });
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create team member" }, { status: 500 });
  }
}
