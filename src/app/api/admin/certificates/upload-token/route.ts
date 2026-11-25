import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { mutateApplication } from "@/lib/convex-server";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || session?.user?.email?.trim().toLowerCase() !== adminEmail) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    const uploadUrl = await mutateApplication<string>("generateUploadUrl");
    return NextResponse.json({ uploadUrl }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "STORAGE_UPLOAD_FAILED" }, { status: 502 });
  }
}
