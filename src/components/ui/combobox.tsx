import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Combobox({ options, value, onChange, placeholder, className }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((opt) => opt.value === value);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          className={cn(
            "border rounded-lg px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 min-w-[160px] text-left",
            className
          )}
        >
          {selected ? selected.label : placeholder || "Selecciona..."}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Content className="bg-white border rounded-lg shadow-lg mt-2 p-2 min-w-[160px] z-50">
        <ul className="flex flex-col gap-1">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                className={cn(
                  "w-full text-left px-2 py-1 rounded hover:bg-blue-100",
                  value === opt.value && "bg-blue-500 text-white"
                )}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  );
} 