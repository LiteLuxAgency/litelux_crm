import type { HTMLAttributes } from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: DivProps) {
  return <div className={className} {...props} />;
}

export function CardHeader({ className = "", ...props }: DivProps) {
  return <div className={className} {...props} />;
}

export function CardTitle({ className = "", ...props }: DivProps) {
  return <h2 className={className} {...props} />;
}

export function CardContent({ className = "", ...props }: DivProps) {
  return <div className={className} {...props} />;
}
