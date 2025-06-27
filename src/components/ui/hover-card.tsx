import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/lib/utils";

interface HoverCardProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function HoverCard({ trigger, children, className }: HoverCardProps) {
  return (
    <HoverCardPrimitive.Root>
      <HoverCardPrimitive.Trigger asChild>{trigger}</HoverCardPrimitive.Trigger>
      <HoverCardPrimitive.Content sideOffset={8} className={cn("bg-white border rounded-lg shadow-lg p-4 z-50 w-80 text-sm", className)}>
        {children}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Root>
  );
} 