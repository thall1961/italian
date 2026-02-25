"use client";

import { logout } from "@/app/logout/actions";

export function SignOutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}
