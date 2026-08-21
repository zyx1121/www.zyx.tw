"use client";

import { useState } from "react";
import { ChevronsUpDown, Italic, Underline } from "lucide-react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShimmeringText } from "@/registry/ui/shimmering-text";
import { ThemeToggle } from "@/registry/ui/theme-toggle";

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

function Section({
  title,
  command,
  children,
}: {
  title: string;
  command: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-medium">{title}</h2>
        <code className="font-mono text-xs text-muted-foreground">
          {command}
        </code>
      </div>
      <div className="space-y-6 rounded-xl bg-muted/40 p-8">{children}</div>
    </section>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(60);

  const trigger = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
  };

  return (
    <>
      <div className="fixed top-6 left-6 z-50">
        <div className="flex items-center gap-2 font-mono text-base font-semibold tracking-tight">
          <ZyxLogo className="size-5" />
          <span className="text-foreground/40">/</span>
          <span>ui</span>
        </div>
      </div>

      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="fixed right-6 bottom-6 z-50">
        <span className="font-mono text-base text-foreground/50">© 2026</span>
      </div>

      <main>
        <div className="mx-auto w-full max-w-3xl space-y-16 px-6 pt-40 pb-32">
          <section className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              <ShimmeringText>ui.zyx.tw</ShimmeringText>
            </h1>
            <p className="text-muted-foreground">
              Stock shadcn/ui on a full grayscale palette, radius raised to
              1rem, plus my own components. Init with the radix base, add the
              theme, done.
            </p>
            <code className="block font-mono text-xs text-muted-foreground">
              bunx shadcn@latest init -b radix -p nova && bunx shadcn@latest add
              https://ui.zyx.tw/r/theme.json
            </code>
          </section>

          <Section
            title="Shimmering Text"
            command="bunx shadcn@latest add https://ui.zyx.tw/r/shimmering-text.json"
          >
            <div className="space-y-2">
              <p className="text-2xl font-medium">
                <ShimmeringText>Generating response...</ShimmeringText>
              </p>
              <p className="text-sm">
                <ShimmeringText duration={3}>
                  Slow shimmer for long waits
                </ShimmeringText>
              </p>
            </div>
          </Section>

          <Section
            title="Theme Toggle"
            command="bunx shadcn@latest add https://ui.zyx.tw/r/theme-toggle.json"
          >
            <ThemeToggle />
          </Section>

          <Section title="Button" command="bunx shadcn@latest add button">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">Extra small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button disabled={loading} onClick={trigger}>
                {loading && <Spinner />}
                {loading ? "Saving..." : "Trigger loading"}
              </Button>
            </div>
          </Section>

          <Section title="Badge" command="bunx shadcn@latest add badge">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </Section>

          <Section
            title="Input / Textarea / Label"
            command="bunx shadcn@latest add input textarea label"
          >
            <div className="grid max-w-sm gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="loki@zyx.tw" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Say something." />
              </div>
              <Input aria-invalid placeholder="Invalid state" />
              <Input disabled placeholder="Disabled" />
            </div>
          </Section>

          <Section
            title="Select / Checkbox / Radio / Switch / Slider"
            command="bunx shadcn@latest add select checkbox radio-group switch slider"
          >
            <div className="grid max-w-sm gap-6">
              <Select defaultValue="matcha">
                <SelectTrigger>
                  <SelectValue placeholder="Pick a flavor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vanilla">Vanilla</SelectItem>
                  <SelectItem value="matcha">Matcha</SelectItem>
                  <SelectItem value="hojicha">Hojicha</SelectItem>
                  <SelectItem value="black-sesame">Black sesame</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Checkbox id="terms" defaultChecked />
                <Label htmlFor="terms">Accept terms</Label>
              </div>
              <RadioGroup defaultValue="comfortable" className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="compact" id="r-compact" />
                  <Label htmlFor="r-compact">Compact</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="comfortable" id="r-comfortable" />
                  <Label htmlFor="r-comfortable">Comfortable</Label>
                </div>
              </RadioGroup>
              <div className="flex items-center gap-2">
                <Switch id="notify" defaultChecked />
                <Label htmlFor="notify">Notifications</Label>
              </div>
              <Slider defaultValue={[40]} max={100} step={1} />
            </div>
          </Section>

          <Section
            title="Tabs / Toggle"
            command="bunx shadcn@latest add tabs toggle toggle-group"
          >
            <Tabs defaultValue="account" className="max-w-sm">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              <TabsContent
                value="account"
                className="text-sm text-muted-foreground"
              >
                Manage your account here.
              </TabsContent>
              <TabsContent
                value="password"
                className="text-sm text-muted-foreground"
              >
                Change your password here.
              </TabsContent>
            </Tabs>
            <div className="flex items-center gap-3">
              <Toggle aria-label="Toggle italic">
                <Italic />
              </Toggle>
              <ToggleGroup type="multiple" variant="outline">
                <ToggleGroupItem value="italic" aria-label="Italic">
                  <Italic />
                </ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="Underline">
                  <Underline />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </Section>

          <Section title="Card" command="bunx shadcn@latest add card">
            <Card className="max-w-sm">
              <CardHeader>
                <CardTitle>Project torpor</CardTitle>
                <CardDescription>
                  Protocol-aware agent hibernation.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Idle agents park their state and release the GPU until the next
                A2A message arrives.
              </CardContent>
              <CardFooter>
                <Button size="sm">Resume</Button>
              </CardFooter>
            </Card>
          </Section>

          <Section
            title="Overlays"
            command="bunx shadcn@latest add dialog alert-dialog sheet popover tooltip dropdown-menu hover-card"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename project</DialogTitle>
                    <DialogDescription>
                      Give the project a new name.
                    </DialogDescription>
                  </DialogHeader>
                  <Input defaultValue="torpor" />
                  <DialogFooter>
                    <Button>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Alert dialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this run?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription>
                      Side panel over a scrim.
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Popover</Button>
                </PopoverTrigger>
                <PopoverContent className="text-sm">
                  Anchored floating surface.
                </PopoverContent>
              </Popover>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>Hover hint</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Menu <ChevronsUpDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem variant="destructive">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">@zyx1121</Button>
                </HoverCardTrigger>
                <HoverCardContent className="text-sm">
                  Loki — NYCU CS, WinLab.
                </HoverCardContent>
              </HoverCard>
            </div>
          </Section>

          <Section
            title="Accordion / Collapsible"
            command="bunx shadcn@latest add accordion collapsible"
          >
            <Accordion type="single" collapsible className="max-w-sm">
              <AccordionItem value="what">
                <AccordionTrigger>What is this?</AccordionTrigger>
                <AccordionContent>
                  Stock shadcn/ui with a grayscale theme.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="why">
                <AccordionTrigger>Why grayscale?</AccordionTrigger>
                <AccordionContent>
                  Color comes from content, not chrome.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Collapsible className="max-w-sm">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronsUpDown /> Toggle details
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
                Hidden details revealed.
              </CollapsibleContent>
            </Collapsible>
          </Section>

          <Section title="Alert" command="bunx shadcn@latest add alert">
            <div className="grid max-w-md gap-4">
              <Alert>
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription>
                  Registry rebuilt on stock shadcn/ui.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Build failed</AlertTitle>
                <AlertDescription>
                  Check the CI logs for details.
                </AlertDescription>
              </Alert>
            </div>
          </Section>

          <Section title="Table" command="bunx shadcn@latest add table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>ui</TableCell>
                  <TableCell>ui.zyx.tw</TableCell>
                  <TableCell className="text-right">live</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>web</TableCell>
                  <TableCell>www.zyx.tw</TableCell>
                  <TableCell className="text-right">live</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Section>

          <Section
            title="Avatar / Kbd / Separator / Skeleton / Spinner / Progress"
            command="bunx shadcn@latest add avatar kbd separator skeleton spinner progress"
          >
            <div className="flex flex-wrap items-center gap-6">
              <Avatar>
                <AvatarImage src="https://github.com/zyx1121.png" alt="Loki" />
                <AvatarFallback>ZY</AvatarFallback>
              </Avatar>
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
              <Spinner />
              <Skeleton className="h-8 w-32" />
            </div>
            <Separator />
            <div className="flex max-w-sm items-center gap-3">
              <Progress value={progress} />
              <Button
                size="xs"
                variant="outline"
                onClick={() => setProgress((p) => (p >= 100 ? 0 : p + 20))}
              >
                +20
              </Button>
            </div>
          </Section>

          <Section
            title="Breadcrumb / Pagination"
            command="bunx shadcn@latest add breadcrumb pagination"
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">zyx.tw</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>ui</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Section>

          <Section title="Sonner" command="bunx shadcn@latest add sonner">
            <Button
              variant="outline"
              onClick={() => toast("Copied to clipboard")}
            >
              Show toast
            </Button>
          </Section>

          <Section
            title="Scroll Area"
            command="bunx shadcn@latest add scroll-area"
          >
            <ScrollArea className="h-40 max-w-sm rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                {Array.from({ length: 12 })
                  .map((_, i) => `Line ${i + 1} of scrollable content.`)
                  .join(" ")}
              </p>
            </ScrollArea>
          </Section>
        </div>
      </main>
    </>
  );
}
