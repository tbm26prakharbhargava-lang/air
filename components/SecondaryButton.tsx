import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export function SecondaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx("rounded-full border border-zinc-700 bg-card px-4 py-2 text-white hover:bg-zinc-800", className)} {...props} />;
}
