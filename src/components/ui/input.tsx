import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={[
        "w-full appearance-none border bg-transparent px-4 text-sm outline-none transition-all duration-200",
        "shadow-none ring-0 focus:border-white/20 focus:bg-white/10 focus:shadow-none",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
