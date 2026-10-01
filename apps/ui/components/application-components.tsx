"use client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { APPLICATION_PRIMITIVES } from "@/lib/application-primitives";
import { AiPrimitives } from "@/components/ai-primitives";
import { Calendar } from "@/components/ui/calendar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
const options = ["All items", "In progress", "Complete"];
const data = [
  { day: "Mon", count: 12 },
  { day: "Tue", count: 18 },
  { day: "Wed", count: 9 },
  { day: "Thu", count: 24 },
  { day: "Fri", count: 16 },
];
export function ApplicationComponents() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <section id="applications" className="scroll-mt-20 space-y-10">
      <h2 className="text-sm/6 font-medium">Application components</h2>
      <p className="text-muted-foreground">
        Stock primitives for forms, data tools and AI interfaces. The theme
        applies without a component fork.
      </p>
      <div className="grid min-w-0 gap-10 md:grid-cols-2">
        <div className="min-w-0 space-y-5">
          <h3>Combobox</h3>
          <Combobox items={options} defaultValue={options[0]}>
            <ComboboxInput
              aria-label="Filter items"
              placeholder="Select an option"
            />
            <ComboboxContent>
              <ComboboxEmpty>No matches</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              Open dialog
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm an action</DialogTitle>
                <DialogDescription>
                  A focused place for a decision.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <h3 className="pt-5">Resizable panels</h3>
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-36! rounded-lg border"
          >
            <ResizablePanel defaultSize="50%">
              <div className="p-5">Content</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="50%">
              <div className="p-5">Preview</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        <div className="space-y-5">
          <h3>Calendar</h3>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border"
          />
        </div>
        <div className="min-w-0 space-y-5 md:col-span-2">
          <h3>Chart</h3>
          <ChartContainer
            config={{ count: { label: "Count", color: "var(--chart-2)" } }}
            className="h-60 w-full"
          >
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
      <AiPrimitives />
      <div className="grid gap-10 sm:grid-cols-2">
        {APPLICATION_PRIMITIVES.map((group) => (
          <div key={group.title} className="space-y-3">
            <h3>{group.title}</h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {group.items.map((name) => (
                <li key={name}>
                  <a
                    href={`https://ui.shadcn.com/docs/components/base/${name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Install primitives with the official shadcn CLI. Data tables, date
        pickers, login forms and chat interfaces compose these primitives in
        your app; they are not separate zyx registry items.
      </p>
    </section>
  );
}
