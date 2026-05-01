import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export function PrimaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx("rounded-full bg-accent text-black px-4 py-2 font-semibold hover:brightness-95", className)} {...props} />;
}
