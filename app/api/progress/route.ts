import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

// GET /api/progress?date=2026-02-21
// Returns the progress record for a given date (or empty defaults)
export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dateKey = req.nextUrl.searchParams.get("date");
  if (!dateKey) {
    return NextResponse.json({ error: "date param required" }, { status: 400 });
  }

  const progress = await prisma.progressDay.findUnique({
    where: { userId_dateKey: { userId, dateKey } },
  });

  return NextResponse.json(
    progress ?? { review: false, learn: false, sentences: false, speak: false }
  );
}

// POST /api/progress
// Body: { date: "2026-02-21", key: "review", done: true }
// Toggles a single task for the given date
export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, key, done } = await req.json();

  if (!date || !key || typeof done !== "boolean") {
    return NextResponse.json(
      { error: "date, key, and done required" },
      { status: 400 }
    );
  }

  // Only allow known task keys
  const validKeys = ["review", "learn", "sentences", "speak"];
  if (!validKeys.includes(key)) {
    return NextResponse.json({ error: "invalid key" }, { status: 400 });
  }

  const progress = await prisma.progressDay.upsert({
    where: { userId_dateKey: { userId, dateKey: date } },
    create: { userId, dateKey: date, [key]: done },
    update: { [key]: done },
  });

  return NextResponse.json(progress);
}
