import { prisma } from "@/lib/prisma";
import { getTodayPlan, todayDateKey } from "@/lib/plan";
import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TaskChecklist } from "./checklist";
import { SignOutButton } from "./sign-out-button";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const dateKey = todayDateKey();
  const plan = getTodayPlan(dateKey);

  if (!plan) {
    return (
      <main className="max-w-md mx-auto px-4 py-8">
        <p className="text-gray-500 text-center">
          No plan for today. You&apos;re either ahead of schedule or the plan
          hasn&apos;t started yet.
        </p>
      </main>
    );
  }

  const { week, day } = plan;

  // Get authenticated user
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  // Load progress for today
  const progress = await prisma.progressDay.findUnique({
    where: { userId_dateKey: { userId: user.id, dateKey } },
  });

  const completed: Record<string, boolean> = {
    review: progress?.review ?? false,
    learn: progress?.learn ?? false,
    sentences: progress?.sentences ?? false,
    speak: progress?.speak ?? false,
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{week.title}</h1>
          <p className="text-gray-500">{day.title}</p>
        </div>
        <SignOutButton />
      </header>

      {/* Agenda checklist */}
      <TaskChecklist
        agenda={day.agenda}
        completed={completed}
        dateKey={dateKey}
      />

      {/* Practice sentences */}
      {day.sentences.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Practice Sentences
          </h2>
          <ul className="space-y-2">
            {day.sentences.map((s, i) => (
              <li
                key={i}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 text-lg italic"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Flashcards button */}
      <div className="mt-8">
        <a
          href="https://www.ricordaresempre.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
        >
          Open Flashcards
        </a>
      </div>
    </main>
  );
}
