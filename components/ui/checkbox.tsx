import * as React from "react";
import { cn } from "@/lib/utils";

function Checkbox({
  className,
  checked,
  onCheckedChange,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={cn(
        "h-4 w-4 rounded border-border text-primary focus:ring-primary",
        className,
      )}
      {...props}
    />
  );
}

export { Checkbox };

