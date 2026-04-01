import type { HTMLAttributes } from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Badge({ className = "", ...props }: DivProps) {
  return <div className={["inline-flex items-center justify-center", className].join(" ")} {...props} />;
}
