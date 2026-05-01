"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  ["/home", "Home"],
  ["/circles", "Circles"],
  ["/events", "Events"],
  ["/matches", "Matches"],
  ["/profile", "Profile"]
] as const;

export function BottomNav() {
  const path = usePathname();
  return <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-bg/95 backdrop-blur p-3"><div className="mx-auto max-w-xl grid grid-cols-5 gap-2">{tabs.map(([href,label]) => <Link key={href} href={href} className={`text-center text-sm ${path.startsWith(href) ? "text-accent" : "text-zinc-400"}`}>{label}</Link>)}</div></nav>;
}
