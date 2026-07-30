import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });

    const MAX_SIZE_MB = Number(process.env.UPLOAD_MAX_SIZE_MB ?? 10);
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ success: false, error: `File too large. Max ${MAX_SIZE_MB}MB` }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Only JPEG, PNG, WebP, GIF allowed" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuid()}.webp`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadsDir, { recursive: true });

    const optimized = await sharp(buffer)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, optimized);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (err) {
    console.error("upload error:", err);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
