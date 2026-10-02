"use client";
import { T, useT } from "@workspace/ui/components/locale-provider";

import { useState } from "react";
import { ChevronsUpDown, Italic, Underline } from "lucide-react";
import { toast } from "sonner";

import { ApplicationComponents } from "@/components/application-components";
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
import { enter, enterDelay } from "@/lib/layout";
import { addCommand, INIT_COMMAND, MARKDOWN_PATH } from "@/lib/site";
import { AskAi } from "@/registry/ui/ask-ai";
import { HdrHighlight } from "@/registry/ui/hdr-highlight";
import { MaskReveal } from "@/registry/ui/mask-reveal";
import { RotatingText } from "@/registry/ui/rotating-text";
import { ScrambleText } from "@/registry/ui/scramble-text";
import { ShimmeringText } from "@/registry/ui/shimmering-text";
import { ThemeToggle } from "@/registry/ui/theme-toggle";

const REGISTRY_ITEMS = [
  "scramble-text",
  "rotating-text",
  "mask-reveal",
  "ask-ai",
  "hdr-highlight",
];

// Rows 0 to 2 are the header, the title and the subtitle.
const FIRST_ROW = 3;

interface ShowcaseItem {
  name: string;
  title: string;
  description: string;
}

// A heading, one muted line, then its demos: 12px, 20px, then 60px apart.
function Group({
  id,
  title,
  description,
  row,
  children,
}: {
  id: string;
  title: string;
  description: string;
  row: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-5">
      <div className={enter} style={enterDelay(row)}>
        <h2 id={`${id}-title`} className="text-sm/6 font-medium">
          <T>{title}</T>
        </h2>
        <p className="mt-3 text-muted-foreground">
          <T>{description}</T>
        </p>
      </div>
      <div className="mt-5 flex flex-col gap-15">{children}</div>
    </section>
  );
}

// A title with its install command on the right edge, 12px over a card. The
// card's 1px border is the page's own line: white at 10% in dark.
function Demo({
  title,
  command,
  row,
  children,
}: {
  title?: string;
  command?: string;
  row: number;
  children: React.ReactNode;
}) {
  return (
    <section className={enter} style={enterDelay(row)}>
      {title && (
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
          <h3>
            <T>{title}</T>
          </h3>
          {command && (
            <code className="font-mono text-xs wrap-break-word text-muted-foreground">
              {command}
            </code>
          )}
        </div>
      )}
      <div className="space-y-5 rounded-lg border p-5">{children}</div>
    </section>
  );
}

export function Showcase({
  theme,
  items,
}: {
  /** The theme item's description. */
  theme: string;
  /** The registry:ui items, in registry.json order. */
  items: ShowcaseItem[];
}) {
  const t = useT();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(60);
  const [scrambleRun, setScrambleRun] = useState(0);
  const [maskRun, setMaskRun] = useState(0);
  const [item, setItem] = useState(0);
  const [itemHovered, setItemHovered] = useState(false);
  const [itemLog, setItemLog] = useState<number[]>([]);

  const onItemChange = (index: number) => {
    setItem(index);
    setItemLog((log) => [...log, index].slice(-12));
  };

  const trigger = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
  };

  const demos: Record<string, React.ReactNode> = {
    "shimmering-text": (
      <div className="space-y-2">
        <p className="text-2xl">
          <ShimmeringText>
            <T>{"Generating response..."}</T>
          </ShimmeringText>
        </p>
        <p className="text-sm">
          <ShimmeringText duration={3}>
            <T>{"Slow shimmer for long waits"}</T>
          </ShimmeringText>
        </p>
      </div>
    ),
    "theme-toggle": <ThemeToggle />,
    "scramble-text": (
      <>
        <div className="space-y-2">
          <ScrambleText
            key={`mount-${scrambleRun}`}
            element="p"
            text={t("Signal, decoded.")}
            className="text-2xl"
          />
          <p className="text-sm text-muted-foreground">
            <T>
              {
                "With trigger=&quot;in-view&quot;, the last line of this page waits until it scrolls into view."
              }
            </T>
          </p>
        </div>
        <Button
          size="xs"
          variant="outline"
          onClick={() => setScrambleRun((run) => run + 1)}
        >
          <T>{"Replay"}</T>
        </Button>
      </>
    ),
    "rotating-text": (
      <>
        <div className="space-y-2">
          <p className="text-2xl">
            <T>{"Built for"}</T>
            <T> </T>
            <RotatingText
              words={[
                "the web.",
                "small screens.",
                "people.",
                "agents too.",
              ].map((word) => t(word))}
            />
          </p>
          <p className="text-sm text-muted-foreground">
            <T>{"Quietly"}</T>
            <T> </T>
            <RotatingText
              transition="fade"
              words={[
                "fading in.",
                "swapping words.",
                "holding its width.",
              ].map((word) => t(word))}
            />
          </p>
        </div>
        <div className="space-y-3">
          <p className="font-mono text-sm">
            <span className="text-muted-foreground">
              <T>{"@zyx1121/"}</T>
            </span>
            <RotatingText
              words={REGISTRY_ITEMS}
              index={item}
              onIndexChange={onItemChange}
              paused={itemHovered}
            />
          </p>
          <div
            className="flex flex-wrap gap-1"
            onPointerLeave={() => setItemHovered(false)}
          >
            {REGISTRY_ITEMS.map((name, index) => (
              <Button
                key={name}
                size="xs"
                variant={index === item ? "secondary" : "ghost"}
                data-item={index}
                onPointerEnter={() => {
                  setItemHovered(true);
                  setItem(index);
                }}
                onFocus={() => {
                  setItemHovered(true);
                  setItem(index);
                }}
                onBlur={() => setItemHovered(false)}
              >
                <T>{name}</T>
              </Button>
            ))}
          </div>
          <p
            data-testid="rotating-text-log"
            className="font-mono text-xs text-muted-foreground tabular-nums"
          >
            <T>{"onIndexChange: "}</T>
            <T>{itemLog.join(" ") || "none yet"}</T>
            <T>{itemHovered ? " (paused)" : ""}</T>
          </p>
        </div>
      </>
    ),
    "mask-reveal": (
      <>
        <MaskReveal key={maskRun}>
          <div className="rounded-2xl bg-secondary px-4 py-2 text-sm text-secondary-foreground">
            <T>{"A feathered mask sweeps in after 1s and settles over 5s."}</T>
          </div>
        </MaskReveal>
        <Button
          size="xs"
          variant="outline"
          onClick={() => setMaskRun((run) => run + 1)}
        >
          <T>{"Replay"}</T>
        </Button>
      </>
    ),
    "ask-ai": (
      // -ml-1 at the call site lines the pill's rounded end up with the text
      // column; flex keeps it out of a line box.
      <AskAi
        className="-ml-1 flex"
        markdownUrl={MARKDOWN_PATH}
        labels={{
          trigger: t("Ask AI"),
          other: t("Other AI"),
          copyPage: t("Copy page"),
          viewMarkdown: t("View as Markdown"),
          copied: t("Copied"),
          failed: t("Copy failed"),
        }}
      />
    ),
    "hdr-highlight": (
      <div className="space-y-4">
        <p className="text-2xl">
          <T>{"Brighter than "}</T>
          <HdrHighlight>
            <T>{"white"}</T>
          </HdrHighlight>
          .
        </p>
        <nav className="flex gap-5 text-sm">
          {["Works", "About", "Contact"].map((label) => (
            <button key={label} type="button">
              <HdrHighlight hover>
                <T>{label}</T>
              </HdrHighlight>
            </button>
          ))}
        </nav>
        <p className="text-sm text-muted-foreground">
          <T>
            {
              "Needs an HDR display in dark mode. The buttons light up on hover or focus and fade back over 2s. SDR screens show plain text."
            }
          </T>
        </p>
      </div>
    ),
  };

  const base: { title: string; add: string; content: React.ReactNode }[] = [
    {
      title: "Button",
      add: "button",
      content: (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <T>{"Default"}</T>
            </Button>
            <Button variant="secondary">
              <T>{"Secondary"}</T>
            </Button>
            <Button variant="outline">
              <T>{"Outline"}</T>
            </Button>
            <Button variant="ghost">
              <T>{"Ghost"}</T>
            </Button>
            <Button variant="destructive">
              <T>{"Destructive"}</T>
            </Button>
            <Button variant="link">
              <T>{"Link"}</T>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">
              <T>{"Extra small"}</T>
            </Button>
            <Button size="sm">
              <T>{"Small"}</T>
            </Button>
            <Button size="default">
              <T>{"Default"}</T>
            </Button>
            <Button size="lg">
              <T>{"Large"}</T>
            </Button>
            <Button disabled={loading} onClick={trigger}>
              {loading && <Spinner />}
              <T>{loading ? "Saving..." : "Trigger loading"}</T>
            </Button>
          </div>
        </>
      ),
    },
    {
      title: "Badge",
      add: "badge",
      content: (
        <div className="flex flex-wrap items-center gap-3">
          <Badge>
            <T>{"Default"}</T>
          </Badge>
          <Badge variant="secondary">
            <T>{"Secondary"}</T>
          </Badge>
          <Badge variant="outline">
            <T>{"Outline"}</T>
          </Badge>
          <Badge variant="destructive">
            <T>{"Destructive"}</T>
          </Badge>
        </div>
      ),
    },
    {
      title: "Input / Textarea / Label",
      add: "input textarea label",
      content: (
        <div className="grid max-w-sm gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">
              <T>{"Email"}</T>
            </Label>
            <Input id="email" type="email" placeholder={t("loki@zyx.tw")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">
              <T>{"Bio"}</T>
            </Label>
            <Textarea id="bio" placeholder={t("Say something.")} />
          </div>
          <Input aria-invalid placeholder={t("Invalid state")} />
          <Input disabled placeholder={t("Disabled")} />
        </div>
      ),
    },
    {
      title: "Select / Checkbox / Radio / Switch / Slider",
      add: "select checkbox radio-group switch slider",
      content: (
        <div className="grid max-w-sm gap-6">
          <Select defaultValue="matcha">
            <SelectTrigger>
              <SelectValue placeholder={t("Pick a flavor")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vanilla">
                <T>{"Vanilla"}</T>
              </SelectItem>
              <SelectItem value="matcha">
                <T>{"Matcha"}</T>
              </SelectItem>
              <SelectItem value="hojicha">
                <T>{"Hojicha"}</T>
              </SelectItem>
              <SelectItem value="black-sesame">
                <T>{"Black sesame"}</T>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Checkbox id="terms" defaultChecked />
            <Label htmlFor="terms">
              <T>{"Accept terms"}</T>
            </Label>
          </div>
          <RadioGroup defaultValue="comfortable" className="flex gap-6">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="compact" id="r-compact" />
              <Label htmlFor="r-compact">
                <T>{"Compact"}</T>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="comfortable" id="r-comfortable" />
              <Label htmlFor="r-comfortable">
                <T>{"Comfortable"}</T>
              </Label>
            </div>
          </RadioGroup>
          <div className="flex items-center gap-2">
            <Switch id="notify" defaultChecked />
            <Label htmlFor="notify">
              <T>{"Notifications"}</T>
            </Label>
          </div>
          <Slider defaultValue={[40]} max={100} step={1} />
        </div>
      ),
    },
    {
      title: "Tabs / Toggle",
      add: "tabs toggle toggle-group",
      content: (
        <>
          <Tabs defaultValue="account" className="max-w-sm">
            <TabsList>
              <TabsTrigger value="account">
                <T>{"Account"}</T>
              </TabsTrigger>
              <TabsTrigger value="password">
                <T>{"Password"}</T>
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="account"
              className="text-sm text-muted-foreground"
            >
              <T>{"Manage your account here."}</T>
            </TabsContent>
            <TabsContent
              value="password"
              className="text-sm text-muted-foreground"
            >
              <T>{"Change your password here."}</T>
            </TabsContent>
          </Tabs>
          <div className="flex items-center gap-3">
            <Toggle aria-label={t("Toggle italic")}>
              <Italic />
            </Toggle>
            <ToggleGroup multiple variant="outline">
              <ToggleGroupItem value="italic" aria-label={t("Italic")}>
                <Italic />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label={t("Underline")}>
                <Underline />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </>
      ),
    },
    {
      title: "Card",
      add: "card",
      content: (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>
              <T>{"Project torpor"}</T>
            </CardTitle>
            <CardDescription>
              <T>{"Protocol-aware agent hibernation."}</T>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <T>
              {
                "Idle agents park their state and release the GPU until the next A2A message arrives."
              }
            </T>
          </CardContent>
          <CardFooter>
            <Button size="sm">
              <T>{"Resume"}</T>
            </Button>
          </CardFooter>
        </Card>
      ),
    },
    {
      title: "Overlays",
      add: "dialog alert-dialog sheet popover tooltip dropdown-menu hover-card",
      content: (
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="outline">
                  <T>{"Dialog"}</T>
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <T>{"Rename project"}</T>
                </DialogTitle>
                <DialogDescription>
                  <T>{"Give the project a new name."}</T>
                </DialogDescription>
              </DialogHeader>
              <Input defaultValue="torpor" />
              <DialogFooter>
                <Button>
                  <T>{"Save"}</T>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive">
                  <T>{"Alert dialog"}</T>
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <T>{"Delete this run?"}</T>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <T>{"This action cannot be undone."}</T>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <T>{"Cancel"}</T>
                </AlertDialogCancel>
                <AlertDialogAction>
                  <T>{"Delete"}</T>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline">
                  <T>{"Sheet"}</T>
                </Button>
              }
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  <T>{"Settings"}</T>
                </SheetTitle>
                <SheetDescription>
                  <T>{"Side panel over a scrim."}</T>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline">
                  <T>{"Popover"}</T>
                </Button>
              }
            />
            <PopoverContent className="text-sm">
              <T>{"Anchored floating surface."}</T>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="outline">
                  <T>{"Tooltip"}</T>
                </Button>
              }
            />
            <TooltipContent>
              <T>{"Hover hint"}</T>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  <T>{"Menu "}</T>
                  <ChevronsUpDown />
                </Button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuLabel>
                <T>{"My account"}</T>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <T>{"Profile"}</T>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <T>{"Billing"}</T>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <T>{"Sign out"}</T>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <HoverCard>
            <HoverCardTrigger
              render={
                <Button variant="link">
                  <T>{"@zyx1121"}</T>
                </Button>
              }
            />
            <HoverCardContent className="text-sm">
              <T>{"Loki, NYCU CS, WinLab."}</T>
            </HoverCardContent>
          </HoverCard>
        </div>
      ),
    },
    {
      title: "Accordion / Collapsible",
      add: "accordion collapsible",
      content: (
        <>
          <Accordion multiple={false} className="max-w-sm">
            <AccordionItem value="what">
              <AccordionTrigger>
                <T>{"What is this?"}</T>
              </AccordionTrigger>
              <AccordionContent>
                <T>{"Stock shadcn/ui with a grayscale theme."}</T>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="why">
              <AccordionTrigger>
                <T>{"Why grayscale?"}</T>
              </AccordionTrigger>
              <AccordionContent>
                <T>{"Color comes from content, not chrome."}</T>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Collapsible className="max-w-sm">
            <CollapsibleTrigger
              render={
                <Button variant="ghost" size="sm">
                  <ChevronsUpDown />
                  <T>{" Toggle details"}</T>
                </Button>
              }
            />
            <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
              <T>{"Hidden details revealed."}</T>
            </CollapsibleContent>
          </Collapsible>
        </>
      ),
    },
    {
      title: "Alert",
      add: "alert",
      content: (
        <div className="grid max-w-md gap-4">
          <Alert>
            <AlertTitle>
              <T>{"Heads up"}</T>
            </AlertTitle>
            <AlertDescription>
              <T>{"Registry rebuilt on stock shadcn/ui."}</T>
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>
              <T>{"Build failed"}</T>
            </AlertTitle>
            <AlertDescription>
              <T>{"Check the CI logs for details."}</T>
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      title: "Table",
      add: "table",
      content: (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <T>{"App"}</T>
              </TableHead>
              <TableHead>
                <T>{"Domain"}</T>
              </TableHead>
              <TableHead className="text-right">
                <T>{"Status"}</T>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <T>{"ui"}</T>
              </TableCell>
              <TableCell>
                <T>{"ui.zyx.tw"}</T>
              </TableCell>
              <TableCell className="text-right">
                <T>{"live"}</T>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <T>{"web"}</T>
              </TableCell>
              <TableCell>
                <T>{"www.zyx.tw"}</T>
              </TableCell>
              <TableCell className="text-right">
                <T>{"live"}</T>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ),
    },
    {
      title: "Avatar / Kbd / Separator / Skeleton / Spinner / Progress",
      add: "avatar kbd separator skeleton spinner progress",
      content: (
        <>
          <div className="flex flex-wrap items-center gap-6">
            <Avatar>
              {/* Served from this site, so the demo makes no request to GitHub. */}
              <AvatarImage src="/avatar.jpg" alt={t("Loki")} />
              <AvatarFallback>
                <T>{"ZY"}</T>
              </AvatarFallback>
            </Avatar>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>
                <T>{"K"}</T>
              </Kbd>
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
              className="tabular-nums"
              onClick={() => setProgress((p) => (p >= 100 ? 0 : p + 20))}
            >
              +20
            </Button>
          </div>
        </>
      ),
    },
    {
      title: "Breadcrumb / Pagination",
      add: "breadcrumb pagination",
      content: (
        <>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <T>{"zyx.tw"}</T>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <T>{"ui"}</T>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Pagination aria-label={t("Pagination")} className="tabular-nums">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text={t("Previous")}
                  aria-label={t("Go to previous page")}
                />
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
                <PaginationNext
                  href="#"
                  text={t("Next")}
                  aria-label={t("Go to next page")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      ),
    },
    {
      title: "Sonner",
      add: "sonner",
      content: (
        <Button
          variant="outline"
          onClick={() => toast(t("Copied to clipboard"))}
        >
          <T>{"Show toast"}</T>
        </Button>
      ),
    },
    {
      title: "Scroll Area",
      add: "scroll-area",
      content: (
        <ScrollArea className="h-40 max-w-sm rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            <T>
              {Array.from({ length: 12 })
                .map((_, i) => `Line ${i + 1} of scrollable content.`)
                .join(" ")}
            </T>
          </p>
        </ScrollArea>
      ),
    },
  ];

  const componentsRow = FIRST_ROW + 2;
  const baseRow = componentsRow + 1 + items.length;
  const lastRow = baseRow + 1 + base.length;

  return (
    <div className="flex flex-col gap-20">
      <Group id="theme" title={t("Theme")} description={theme} row={FIRST_ROW}>
        <Demo row={FIRST_ROW + 1}>
          {/* Each command wraps at its spaces, with continuation lines
              indented under the first, so a phone shows it whole. */}
          <pre className="space-y-1 font-mono text-sm whitespace-pre-wrap">
            {[INIT_COMMAND, addCommand("theme")].map((command) => (
              <code
                key={command}
                className="block pl-4 -indent-4 wrap-break-word"
              >
                {command}
              </code>
            ))}
          </pre>
        </Demo>
      </Group>

      <Group
        id="components"
        title={t("Components")}
        description="What shadcn/ui does not have, one component per file."
        row={componentsRow}
      >
        {items.map(({ name, title, description }, index) => (
          <Demo
            key={name}
            title={t(title)}
            command={addCommand(name)}
            row={componentsRow + 1 + index}
          >
            {demos[name] ?? (
              <p className="text-muted-foreground">
                <T>{description}</T>
              </p>
            )}
          </Demo>
        ))}
      </Group>

      <Group
        id="base"
        title={t("Base components")}
        description="Stock shadcn/ui on the theme, straight from the shadcn CLI."
        row={baseRow}
      >
        {base.map(({ title, add, content }, index) => (
          <Demo
            key={title}
            title={t(title)}
            command={`bunx shadcn@latest add ${add}`}
            row={baseRow + 1 + index}
          >
            <T>{content}</T>
          </Demo>
        ))}
      </Group>

      <ApplicationComponents />

      <div className={enter} style={enterDelay(lastRow)}>
        <ScrambleText
          key={`view-${scrambleRun}`}
          element="p"
          trigger="in-view"
          speed={30}
          text={t("This line decoded as it scrolled into view.")}
          className="text-sm text-muted-foreground"
        />
      </div>
    </div>
  );
}
