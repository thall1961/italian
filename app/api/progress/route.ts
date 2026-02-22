import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Single-user helper: get or create the one user
async function getUser() {
  const user = await prisma.user.findFirst();
  if (user) return user;
  return prisma.user.create({ data: {} });
}

// GET /api/progress?date=2026-02-21
// Returns the progress record for a given date (or empty defaults)
export async function GET(req: NextRequest) {
  const dateKey = req.nextUrl.searchParams.get("date");
  if (!dateKey) {
    return NextResponse.json({ error: "date param required" }, { status: 400 });
  }

  const user = await getUser();
  const progress = await prisma.progressDay.findUnique({
    where: { userId_dateKey: { userId: user.id, dateKey } },
  });

  return NextResponse.json(
    progress ?? { review: false, learn: false, sentences: false, speak: false }
  );
}

// POST /api/progress
// Body: { date: "2026-02-21", key: "review", done: true }
// Toggles a single task for the given date
export async function POST(req: NextRequest) {
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

  const user = await getUser();

  const progress = await prisma.progressDay.upsert({
    where: { userId_dateKey: { userId: user.id, dateKey: date } },
    create: { userId: user.id, dateKey: date, [key]: done },
    update: { [key]: done },
  });

  return NextResponse.json(progress);
}
