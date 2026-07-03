import * as React from "react";

import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

export interface CopyCommandProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  prompt?: string;
  copyLabel?: string;
  multiline?: boolean;
}

export function CopyCommand({
  value,
  prompt = "$",
  copyLabel,
  multiline = false,
  className,
  ...props
}: CopyCommandProps) {
  return (
    <div
      data-slot="copy-command"
      className={cn(
        "flex items-start gap-2 rounded-md bg-block pr-2 pl-4 text-sm corner-token",
        className
      )}
      {...props}
    >
      <code
        className={cn(
          "min-w-0 flex-1 overflow-x-auto py-3 font-mono",
          multiline ? "break-words whitespace-pre-wrap" : "whitespace-nowrap"
        )}
      >
        {prompt ? (
          <span className="text-foreground/50 select-none">{prompt} </span>
        ) : null}
        {value}
      </code>
      <CopyButton
        value={value}
        label={copyLabel ?? `Copy ${value}`}
        className="mt-1.5 shrink-0"
      />
    </div>
  );
}
