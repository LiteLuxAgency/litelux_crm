import type { HTMLAttributes } from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Avatar({ className = "", ...props }: DivProps) {
  return <div className={["overflow-hidden rounded-full", className].join(" ")} {...props} />;
}

export function AvatarFallback({ className = "", ...props }: DivProps) {
  return <div className={["flex h-full w-full items-center justify-center", className].join(" ")} {...props} />;
}
