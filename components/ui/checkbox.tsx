"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { CheckIcon, MinusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<CheckboxPrimitive.Root.Props, "checked"> {
  checked?: boolean | "indeterminate";
}

function Checkbox({ className, checked, ...props }: CheckboxProps) {
  const isIndeterminate = checked === "indeterminate";
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={isIndeterminate ? undefined : checked}
      indeterminate={isIndeterminate}
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:data-checked:bg-primary cursor-pointer",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        {isIndeterminate ? (
          <MinusIcon className="h-3 w-3 stroke-[3]" />
        ) : (
          <CheckIcon className="h-3.5 w-3.5 stroke-[2.5]" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
