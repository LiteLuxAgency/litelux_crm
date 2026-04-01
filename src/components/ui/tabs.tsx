import React, { createContext, useContext } from "react";

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  value,
  onValueChange,
  children,
}: React.PropsWithChildren<TabsContextValue>) {
  return <TabsContext.Provider value={{ value, onValueChange }}>{children}</TabsContext.Provider>;
}

export function TabsList({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({
  value,
  className = "",
  children,
}: React.PropsWithChildren<{ value: string; className?: string }>) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsTrigger должен использоваться внутри Tabs");
  }

  const active = context.value === value;

  return (
    <button
      type="button"
      data-state={active ? "active" : "inactive"}
      onClick={() => context.onValueChange(value)}
      className={["inline-flex items-center justify-center px-3 py-2 transition-all duration-200", className].join(" ")}
    >
      {children}
    </button>
  );
}
