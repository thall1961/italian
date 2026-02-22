import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";
import { getTodayPlan, todayDateKey } from "@/lib/plan";

// GET /api/cron/daily
// Called once per morning by Vercel Cron (or manually).
// Sends a daily SMS reminder with today's agenda.
export async function GET() {
  const dateKey = todayDateKey();
  const plan = getTodayPlan(dateKey);

  if (!plan) {
    return NextResponse.json({ skipped: true, reason: "no plan for today" });
  }

  const { week, day } = plan;

  // Build message
  const agendaLines = day.agenda
    .map((a) => `• ${a.label} (${a.minutes}m)`)
    .join("\n");

  const starter =
    day.sentences.length > 0
      ? `\nStart with: ${day.sentences[0]}`
      : "";

  const body = `🇮🇹 Italian Training — ${week.title} ${day.title}\n\n${agendaLines}${starter}`;

  // Find user with SMS enabled
  const user = await prisma.user.findFirst({
    where: { smsEnabled: true, phone: { not: null } },
  });

  if (!user?.phone) {
    // Also check env var as fallback for single-user setup
    const fallbackPhone = process.env.TWILIO_TO_PHONE;
    if (fallbackPhone) {
      await sendSms(fallbackPhone, body);
      await prisma.smsLog.create({ data: { to: fallbackPhone, body } });
      return NextResponse.json({ sent: true, to: "env" });
    }
    return NextResponse.json({ skipped: true, reason: "no SMS recipient" });
  }

  await sendSms(user.phone, body);
  await prisma.smsLog.create({ data: { to: user.phone, body } });

  return NextResponse.json({ sent: true, to: user.phone });
}
