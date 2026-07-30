import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: ["announcement_enabled", "announcement_message", "announcement_type", "announcement_dismissible"] } },
    });
    const map: Record<string, string> = {};
    rows.forEach((r) => { map[r.key] = r.value; });

    return NextResponse.json({
      enabled: map["announcement_enabled"] === "true",
      message: map["announcement_message"] ?? "",
      type: (map["announcement_type"] ?? "info") as "info" | "warning" | "danger" | "success",
      dismissible: map["announcement_dismissible"] !== "false",
    });
  } catch {
    return NextResponse.json({ enabled: false, message: "", type: "info", dismissible: true });
  }
}
