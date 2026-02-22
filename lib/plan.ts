import plan from "@/plans/month1.json";

// Types for the plan structure
export type AgendaItem = {
  key: string;
  label: string;
  minutes: number;
};

export type Day = {
  title: string;
  sentences: string[];
  agenda: AgendaItem[];
};

export type Week = {
  title: string;
  days: Day[];
};

export type Plan = {
  startDate: string;
  weeks: Week[];
};

// Compute today's plan based on days elapsed since the plan start date.
// Returns null if the date falls outside the plan range.
export function getTodayPlan(dateKey: string): {
  week: Week;
  day: Day;
  weekIndex: number;
  dayIndex: number;
} | null {
  const start = new Date(plan.startDate + "T00:00:00");
  const current = new Date(dateKey + "T00:00:00");
  const diffDays = Math.floor(
    (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return null;

  // Walk through weeks to find the right position
  let remaining = diffDays;
  for (let wi = 0; wi < plan.weeks.length; wi++) {
    const week = plan.weeks[wi];
    if (remaining < week.days.length) {
      return {
        week,
        day: week.days[remaining],
        weekIndex: wi,
        dayIndex: remaining,
      };
    }
    remaining -= week.days.length;
  }

  return null; // Past the end of the plan
}

// Get today's date as YYYY-MM-DD
export function todayDateKey(): string {
  return new Date().toISOString().split("T")[0];
}
