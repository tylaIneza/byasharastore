import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emitStoreUpdate } from "@/lib/events";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await prisma.siteSetting.findMany({ orderBy: { group: "asc" } });
    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { settings } = await req.json() as { settings: { key: string; value: string }[] };
    if (!Array.isArray(settings)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    await Promise.all(
      settings.map(({ key, value }) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, label: key, type: "text", group: "general" },
        })
      )
    );

    emitStoreUpdate("settings");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
