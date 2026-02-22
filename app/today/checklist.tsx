"use client";

import { useOptimistic, useTransition } from "react";
import type { AgendaItem } from "@/lib/plan";

type Props = {
  agenda: AgendaItem[];
  completed: Record<string, boolean>;
  dateKey: string;
};

export function TaskChecklist({ agenda, completed, dateKey }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(completed);
  const [, startTransition] = useTransition();

  function toggle(key: string) {
    const newVal = !optimistic[key];
    startTransition(async () => {
      setOptimistic((prev) => ({ ...prev, [key]: newVal }));
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateKey, key, done: newVal }),
      });
    });
  }

  return (
    <ul className="space-y-2">
      {agenda.map((item) => {
        const done = optimistic[item.key] ?? false;
        return (
          <li key={item.key}>
            <button
              onClick={() => toggle(item.key)}
              className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                done
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  done
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {done && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={done ? "line-through text-gray-400" : ""}>
                {item.label}
              </span>
              <span className="ml-auto text-sm text-gray-400">
                {item.minutes}m
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
