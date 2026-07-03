"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface CopyButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value"
> {
  value: string;
  label?: string;
  copiedLabel?: string;
}

export function CopyButton({
  value,
  label,
  copiedLabel = "Copied",
  className,
  onClick,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const timeout = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeout.current) window.clearTimeout(timeout.current);
    };
  }, []);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || pending) return;

    setPending(true);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeout.current) window.clearTimeout(timeout.current);
      timeout.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      if (timeout.current) window.clearTimeout(timeout.current);
      setCopied(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="raw"
      loading={pending}
      aria-label={label ?? `Copy ${value}`}
      title={copied ? copiedLabel : (label ?? "Copy")}
      data-copied={copied || undefined}
      className={cn(
        "size-8 rounded-full text-foreground/60 hover:bg-foreground/5 hover:text-foreground",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {pending ? null : copied ? (
        <Check aria-hidden className="size-4" />
      ) : (
        <Copy aria-hidden className="size-4" />
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </Button>
  );
}
