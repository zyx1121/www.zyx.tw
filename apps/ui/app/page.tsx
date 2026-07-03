"use client";

import { useState } from "react";

import { useTheme } from "next-themes";

import { Container } from "@/registry/blocks/container";
import { Corner } from "@/registry/blocks/corner";
import { Surface } from "@/registry/blocks/surface";
import { Badge } from "@/registry/ui/badge";
import { Button } from "@/registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/ui/card";
import { CopyButton } from "@/registry/ui/copy-button";
import { CopyCommand } from "@/registry/ui/copy-command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/ui/dialog";
import { Input } from "@/registry/ui/input";
import { Label } from "@/registry/ui/label";
import { SegmentedControl } from "@/registry/ui/segmented-control";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/ui/table";
import { Textarea } from "@/registry/ui/textarea";
import { Tooltip } from "@/registry/ui/tooltip";

function ZyxLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 641 580"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path d="M419.89 61.7425C428.796 59.2562 438.981 58.9078 448.158 64.2058C456.059 68.7673 460.745 76.123 463.334 83.7699C465.882 91.2949 466.709 99.9039 466.508 108.826C466.108 126.684 461.494 148.959 453.773 173.645C450.101 185.383 447.581 193.47 446.105 199.573C444.565 205.942 444.753 207.992 444.822 208.346C445.34 210.997 445.889 212.281 446.364 213.104C446.839 213.928 447.677 215.045 449.714 216.818C449.985 217.054 451.665 218.243 457.953 220.094C463.976 221.868 472.239 223.728 484.241 226.418C509.481 232.075 531.079 239.217 546.745 247.799C554.571 252.086 561.613 257.106 566.856 263.075C572.184 269.141 576.211 276.877 576.211 286C576.21 296.596 570.817 305.244 564.21 311.714C557.636 318.153 548.782 323.567 538.819 328.193C518.816 337.48 491.147 345.031 458.879 350.567C436.586 354.392 420.163 357.211 407.812 359.666C395.272 362.159 387.953 364.09 383.414 365.914C376.054 368.872 372.724 370.34 369.78 372.039C366.837 373.739 363.9 375.89 357.659 380.785C353.81 383.804 348.478 389.176 340.049 398.789C331.747 408.258 321.094 421.071 306.635 438.465C285.706 463.642 265.332 483.828 247.288 496.508C238.3 502.823 229.184 507.783 220.321 510.258C211.415 512.744 201.229 513.092 192.053 507.794C184.152 503.232 179.466 495.877 176.876 488.23C174.328 480.705 173.501 472.096 173.701 463.174C174.102 445.317 178.716 423.041 186.437 398.354C190.109 386.616 192.629 378.529 194.105 372.425C195.645 366.058 195.457 364.008 195.388 363.653C194.87 361.003 194.321 359.718 193.846 358.895C193.37 358.072 192.533 356.954 190.496 355.18C190.224 354.943 188.543 353.756 182.257 351.905C176.234 350.131 167.97 348.271 155.969 345.582C130.73 339.925 109.132 332.784 93.4671 324.202C85.6402 319.915 78.5979 314.894 73.355 308.925C68.0272 302.859 64.0003 295.124 64 286.001C64.0001 275.405 69.3942 266.757 76.0003 260.287C82.575 253.848 91.4281 248.434 101.391 243.808C121.394 234.521 149.063 226.968 181.33 221.432C203.624 217.607 220.047 214.788 232.398 212.333C244.938 209.84 252.257 207.909 256.796 206.085C264.156 203.127 267.486 201.66 270.43 199.96C273.373 198.261 276.309 196.11 282.55 191.215C286.4 188.196 291.732 182.823 300.161 173.21C308.463 163.741 319.116 150.928 333.575 133.534C354.504 108.357 374.878 88.1713 392.922 75.4917C401.91 69.176 411.026 64.2168 419.89 61.7425Z" />
    </svg>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [segment, setSegment] = useState("shell");
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const trigger = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
  };

  return (
    <>
      <Corner at="top-left">
        <Tooltip content="Loki's component registry" side="bottom">
          <div className="flex items-center gap-2 font-mono text-base font-semibold tracking-tight">
            <ZyxLogo className="size-5" />
            <span className="text-foreground/40">/</span>
            <span>ui</span>
          </div>
        </Tooltip>
      </Corner>

      <Corner at="top-right">
        <Tooltip
          content={dark ? "Switch to light mode" : "Switch to dark mode"}
          side="bottom"
        >
          <Button
            variant="raw"
            onClick={() => setTheme(dark ? "light" : "dark")}
            aria-label="Toggle theme"
            className="font-mono text-base"
          >
            {dark ? "light" : "dark"}
          </Button>
        </Tooltip>
      </Corner>

      <Corner at="bottom-right">
        <Tooltip content="© 2026 zyx1121" side="top">
          <span className="font-mono text-base text-foreground/50">© 2026</span>
        </Tooltip>
      </Corner>

      <main>
        <Container size="lg" className="space-y-16 pt-40 pb-32">
          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium">Button</h2>
              <code className="text-xs text-foreground/60">
                bunx shadcn@latest add @zyx1121/button
              </code>
            </div>

            <Surface size="lg" className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button>Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="raw">Raw</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled>Disabled</Button>
                <Button loading={loading} onClick={trigger}>
                  Trigger async
                </Button>
              </div>
            </Surface>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium">Badge</h2>
              <code className="text-xs text-foreground/60">
                bunx shadcn@latest add @zyx1121/badge
              </code>
            </div>

            <Surface size="lg" className="flex flex-wrap items-center gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </Surface>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium">Tooltip</h2>
              <code className="text-xs text-foreground/60">
                bunx shadcn@latest add @zyx1121/tooltip
              </code>
            </div>

            <Surface size="lg" className="flex flex-wrap items-center gap-3">
              <Tooltip content="Default tooltip on top">
                <Button variant="outline">Hover me</Button>
              </Tooltip>
              <Tooltip content="Bottom placement" side="bottom">
                <Button variant="outline">Bottom</Button>
              </Tooltip>
              <Tooltip content="Right placement" side="right">
                <Button variant="outline">Right</Button>
              </Tooltip>
            </Surface>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium">Copy</h2>
              <code className="text-xs text-foreground/60">
                bunx shadcn@latest add @zyx1121/copy-command
              </code>
            </div>

            <Surface size="lg" className="space-y-4">
              <CopyCommand value="bunx shadcn@latest add @zyx1121/surface" />
              <div className="flex items-center gap-2">
                <code className="rounded-md bg-background px-3 py-2 font-mono text-sm">
                  claude-statusline
                </code>
                <CopyButton
                  value="claude-statusline"
                  label="Copy project name"
                />
              </div>
            </Surface>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium">Segmented Control</h2>
              <code className="text-xs text-foreground/60">
                bunx shadcn@latest add @zyx1121/segmented-control
              </code>
            </div>

            <Surface size="lg" className="space-y-4">
              <SegmentedControl
                ariaLabel="Install mode"
                value={segment}
                onValueChange={setSegment}
                options={[
                  { value: "shell", label: "Shell" },
                  { value: "claude", label: "Claude" },
                  { value: "manual", label: "Manual" },
                ]}
              />
              <p className="text-sm text-foreground/60">
                Current segment:{" "}
                <span className="font-mono text-foreground">{segment}</span>
              </p>
            </Surface>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium">Table</h2>
              <code className="text-xs text-foreground/60">
                bunx shadcn@latest add @zyx1121/table
              </code>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Primitive</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Shape</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono">surface</TableCell>
                  <TableCell>registry:block</TableCell>
                  <TableCell>rounded-xl + bg-block</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">copy-command</TableCell>
                  <TableCell>registry:ui</TableCell>
                  <TableCell>rounded-md + copy action</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">segmented-control</TableCell>
                  <TableCell>registry:ui</TableCell>
                  <TableCell>rounded-full + bg-block</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium">Form</h2>
              <code className="text-xs text-foreground/60">
                bunx shadcn@latest add @zyx1121/input @zyx1121/label
              </code>
            </div>

            <Surface size="lg" className="grid max-w-sm gap-4">
              <div className="grid gap-2">
                <Label htmlFor="demo-email">Email</Label>
                <Input
                  id="demo-email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="demo-msg">Message</Label>
                <Textarea id="demo-msg" placeholder="Leave a comment..." />
              </div>
            </Surface>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium">Card</h2>
              <code className="text-xs text-foreground/60">
                bunx shadcn@latest add @zyx1121/card
              </code>
            </div>

            <Card className="max-w-sm">
              <CardHeader>
                <CardTitle>Component registry</CardTitle>
                <CardDescription>
                  Copy in, own outright. Every piece ships finished.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-foreground/80">
                Borderless by design — separation comes from the block surface
                color, not a stroke.
              </CardContent>
              <CardFooter>
                <Button size="sm">Install</Button>
                <Button size="sm" variant="ghost">
                  Docs
                </Button>
              </CardFooter>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-medium">Dialog</h2>
              <code className="text-xs text-foreground/60">
                bunx shadcn@latest add @zyx1121/dialog
              </code>
            </div>

            <Surface size="lg">
              <Dialog>
                <DialogTrigger
                  render={<Button variant="outline">Open dialog</Button>}
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete project</DialogTitle>
                    <DialogDescription>
                      This permanently removes the project and everything in it.
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose
                      render={<Button variant="ghost">Cancel</Button>}
                    />
                    <DialogClose render={<Button>Delete</Button>} />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Surface>
          </section>
        </Container>
      </main>
    </>
  );
}
