import Link from "next/link";

import { cn } from "@workspace/ui/lib/utils";
import { enterRow } from "@workspace/ui/lib/layout";

import type { DocGroup } from "@/lib/docs";

// Rows 0 to 2 are the header, the title and the subtitle.
const FIRST_ROW = 3;

// A section: a heading and, if it has one, a muted line, then its content.
function Group({
  id,
  title,
  description,
  row,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  row: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-5">
      <div className={enterRow(row)}>
        <h2 id={`${id}-title`} className="font-medium">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

// The home page: the init command, then every component as a row linking to
// its page. Rows are split by dividers, never framed.
export function Showcase({
  initCommand,
  groups,
}: {
  initCommand: string;
  groups: DocGroup[];
}) {
  return (
    <div className="flex flex-col gap-20">
      <Group
        id="start"
        title="Get started"
        description="Init a project on the base: tokens, fonts and the @zyx1121 registry in one step."
        row={FIRST_ROW}
      >
        <pre
          className={cn(
            "overflow-x-auto rounded-control bg-muted p-4 font-mono text-caption",
            enterRow(FIRST_ROW + 1)
          )}
        >
          {initCommand}
        </pre>
      </Group>
      <div id="components" className="flex scroll-mt-5 flex-col gap-20">
        {groups.map((group, index) => (
          <Group
            key={group.title}
            id={group.title.toLowerCase()}
            title={group.title}
            row={FIRST_ROW + 2 + index}
          >
            <ul className={enterRow(FIRST_ROW + 2 + index)}>
              {group.items.map((item) => (
                <li key={item.name} className="border-b border-border">
                  <Link
                    href={`/${item.name}`}
                    className="flex flex-col gap-1 py-4 transition-colors duration-state hover:text-muted-foreground sm:flex-row sm:gap-5"
                  >
                    <span className="font-medium sm:w-40 sm:shrink-0">
                      {item.title}
                    </span>
                    <span className="text-muted-foreground">
                      {item.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Group>
        ))}
      </div>
    </div>
  );
}
