import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  size?: "default" | "icon";
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 border text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-200/30 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "border-transparent bg-white/10 text-white hover:bg-white/15",
    outline: "border-white/10 bg-transparent text-white hover:bg-white/10",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    icon: "h-10 w-10",
  };

  return <button type={type} className={[base, variants[variant], sizes[size], className].join(" ")} {...props} />;
}
