"use client";

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
        <h2 id={`${id}-title`} className="text-2xl">
          {title}
        </h2>
        <p className="mt-3 text-muted-foreground">{description}</p>
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
          <h3>{title}</h3>
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
          <ShimmeringText>Generating response...</ShimmeringText>
        </p>
        <p className="text-sm">
          <ShimmeringText duration={3}>
            Slow shimmer for long waits
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
            text="Signal, decoded."
            className="text-2xl"
          />
          <p className="text-sm text-muted-foreground">
            With trigger=&quot;in-view&quot;, the last line of this page waits
            until it scrolls into view.
          </p>
        </div>
        <Button
          size="xs"
          variant="outline"
          onClick={() => setScrambleRun((run) => run + 1)}
        >
          Replay
        </Button>
      </>
    ),
    "rotating-text": (
      <>
        <div className="space-y-2">
          <p className="text-2xl">
            Built for{" "}
            <RotatingText
              words={["the web.", "small screens.", "people.", "agents too."]}
            />
          </p>
          <p className="text-sm text-muted-foreground">
            Quietly{" "}
            <RotatingText
              transition="fade"
              words={["fading in.", "swapping words.", "holding its width."]}
            />
          </p>
        </div>
        <div className="space-y-3">
          <p className="font-mono text-sm">
            <span className="text-muted-foreground">@zyx1121/</span>
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
                {name}
              </Button>
            ))}
          </div>
          <p
            data-testid="rotating-text-log"
            className="font-mono text-xs text-muted-foreground tabular-nums"
          >
            onIndexChange: {itemLog.join(" ") || "none yet"}
            {itemHovered ? " (paused)" : ""}
          </p>
        </div>
      </>
    ),
    "mask-reveal": (
      <>
        <MaskReveal key={maskRun}>
          <div className="rounded-2xl bg-secondary px-4 py-2 text-sm text-secondary-foreground">
            A feathered mask sweeps in after 1s and settles over 5s.
          </div>
        </MaskReveal>
        <Button
          size="xs"
          variant="outline"
          onClick={() => setMaskRun((run) => run + 1)}
        >
          Replay
        </Button>
      </>
    ),
    "ask-ai": (
      // -ml-1 at the call site lines the pill's rounded end up with the text
      // column; flex keeps it out of a line box.
      <AskAi className="-ml-1 flex" markdownUrl={MARKDOWN_PATH} />
    ),
    "hdr-highlight": (
      <div className="space-y-4">
        <p className="text-2xl">
          Brighter than <HdrHighlight>white</HdrHighlight>.
        </p>
        <nav className="flex gap-5 text-sm">
          {["Works", "About", "Contact"].map((label) => (
            <button key={label} type="button">
              <HdrHighlight hover>{label}</HdrHighlight>
            </button>
          ))}
        </nav>
        <p className="text-sm text-muted-foreground">
          Needs an HDR display in dark mode. The buttons light up on hover or
          focus and fade back over 2s. SDR screens show plain text.
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
        </>
      ),
    },
    {
      title: "Badge",
      add: "badge",
      content: (
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      ),
    },
    {
      title: "Input / Textarea / Label",
      add: "input textarea label",
      content: (
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
      ),
    },
    {
      title: "Select / Checkbox / Radio / Switch / Slider",
      add: "select checkbox radio-group switch slider",
      content: (
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
      ),
    },
    {
      title: "Tabs / Toggle",
      add: "tabs toggle toggle-group",
      content: (
        <>
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
            <ToggleGroup multiple variant="outline">
              <ToggleGroupItem value="italic" aria-label="Italic">
                <Italic />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline">
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
            <CardTitle>Project torpor</CardTitle>
            <CardDescription>Protocol-aware agent hibernation.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Idle agents park their state and release the GPU until the next A2A
            message arrives.
          </CardContent>
          <CardFooter>
            <Button size="sm">Resume</Button>
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
            <DialogTrigger render={<Button variant="outline">Dialog</Button>} />
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
            <AlertDialogTrigger
              render={<Button variant="destructive">Alert dialog</Button>}
            />
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
            <SheetTrigger render={<Button variant="outline">Sheet</Button>} />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>Side panel over a scrim.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Popover>
            <PopoverTrigger
              render={<Button variant="outline">Popover</Button>}
            />
            <PopoverContent className="text-sm">
              Anchored floating surface.
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger
              render={<Button variant="outline">Tooltip</Button>}
            />
            <TooltipContent>Hover hint</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  Menu <ChevronsUpDown />
                </Button>
              }
            />
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
            <HoverCardTrigger
              render={<Button variant="link">@zyx1121</Button>}
            />
            <HoverCardContent className="text-sm">
              Loki, NYCU CS, WinLab.
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
            <CollapsibleTrigger
              render={
                <Button variant="ghost" size="sm">
                  <ChevronsUpDown /> Toggle details
                </Button>
              }
            />
            <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
              Hidden details revealed.
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
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>
              Registry rebuilt on stock shadcn/ui.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Build failed</AlertTitle>
            <AlertDescription>Check the CI logs for details.</AlertDescription>
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
              <AvatarImage src="/avatar.jpg" alt="Loki" />
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
                <BreadcrumbLink href="/">zyx.tw</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>ui</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Pagination className="tabular-nums">
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
        </>
      ),
    },
    {
      title: "Sonner",
      add: "sonner",
      content: (
        <Button variant="outline" onClick={() => toast("Copied to clipboard")}>
          Show toast
        </Button>
      ),
    },
    {
      title: "Scroll Area",
      add: "scroll-area",
      content: (
        <ScrollArea className="h-40 max-w-sm rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            {Array.from({ length: 12 })
              .map((_, i) => `Line ${i + 1} of scrollable content.`)
              .join(" ")}
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
      <Group id="theme" title="Theme" description={theme} row={FIRST_ROW}>
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
        title="Components"
        description="What shadcn/ui does not have, one component per file."
        row={componentsRow}
      >
        {items.map(({ name, title, description }, index) => (
          <Demo
            key={name}
            title={title}
            command={addCommand(name)}
            row={componentsRow + 1 + index}
          >
            {demos[name] ?? (
              <p className="text-muted-foreground">{description}</p>
            )}
          </Demo>
        ))}
      </Group>

      <Group
        id="base"
        title="Base components"
        description="Stock shadcn/ui on the theme, straight from the shadcn CLI."
        row={baseRow}
      >
        {base.map(({ title, add, content }, index) => (
          <Demo
            key={title}
            title={title}
            command={`bunx shadcn@latest add ${add}`}
            row={baseRow + 1 + index}
          >
            {content}
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
          text="This line decoded as it scrolled into view."
          className="text-sm text-muted-foreground"
        />
      </div>
    </div>
  );
}
