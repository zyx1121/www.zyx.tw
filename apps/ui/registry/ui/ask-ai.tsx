"use client";

import { useEffect, useState } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  SparklesIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Brand marks: path data from Simple Icons (https://simpleicons.org), CC0 1.0.
// Claude, Google and Markdown come from 16.32.0. OpenAI comes from 15.16.0, the
// last release that has it: 16.0.0 removed it (simple-icons#13944) while the
// redesigned mark awaits OpenAI's permission. The marks are trademarks of
// their owners and only name the services the links open.
function BrandIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

const OPENAI =
  "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z";

const CLAUDE =
  "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z";

const GOOGLE =
  "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z";

const MARKDOWN =
  "M22.27 19.385H1.73A1.73 1.73 0 010 17.655V6.345a1.73 1.73 0 011.73-1.73h20.54A1.73 1.73 0 0124 6.345v11.308a1.73 1.73 0 01-1.73 1.731zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.46v7.847zM21.232 12h-2.309V8.077h-2.307V12h-2.308l3.461 4.039z";

// Icons are 16px on small screens and 12px from `sm` up, like the pill.
const ICON = "size-4 sm:size-3";

// Menu geometry: the popup is rounded-2xl with p-1, items are rounded-xl and at
// least 28px tall, so the outer radius is exactly the inner radius plus 4px.
const ITEM =
  "min-h-7 gap-2 rounded-xl px-2 py-1.5 text-sm sm:gap-1 sm:px-2.5 sm:text-xs";

const DEFAULT_PROMPT =
  "Read {url} and explain what this page covers. Start with a short summary, then answer my questions about it.";

interface AskAiLabels {
  trigger: string;
  chatgpt: string;
  claude: string;
  google: string;
  other: string;
  copyPage: string;
  viewMarkdown: string;
  copied: string;
  failed: string;
}

const DEFAULT_LABELS: AskAiLabels = {
  trigger: "Ask AI",
  chatgpt: "ChatGPT",
  claude: "Claude",
  google: "Google AI Mode",
  other: "Other AI",
  copyPage: "Copy page",
  viewMarkdown: "View as Markdown",
  copied: "Copied",
  failed: "Copy failed",
};

interface AskAiProvider {
  id: string;
  label: string;
  /** Link template. `{prompt}` becomes the URL-encoded prompt; without it the prompt is appended. */
  href: string;
  icon?: React.ReactNode;
}

function providerHref(template: string, prompt: string) {
  const query = encodeURIComponent(prompt);
  return template.includes("{prompt}")
    ? template.split("{prompt}").join(query)
    : template + query;
}

// The page to ask about when no `url` is given: its canonical URL, else the
// address without query and fragment. Those can carry tokens, and a crafted
// link could use them to put its own words into the prompt.
function currentPageUrl() {
  const canonical = document.querySelector<HTMLLinkElement>(
    'link[rel~="canonical"]'
  )?.href;
  return canonical || `${window.location.origin}${window.location.pathname}`;
}

function fetchText(url: string) {
  return fetch(url).then((response) => {
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.text();
  });
}

async function copyText(source: string | Promise<string>) {
  if (typeof source === "string") {
    await navigator.clipboard.writeText(source);
    return;
  }
  // Hand the clipboard a promise inside the click, so browsers that end the
  // user gesture at the first await (Safari) still allow the write.
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
    try {
      const blob = source.then(
        (text) => new Blob([text], { type: "text/plain" })
      );
      await navigator.clipboard.write([
        new ClipboardItem({ "text/plain": blob }),
      ]);
      return;
    } catch {
      // Fall through to writeText.
    }
  }
  await navigator.clipboard.writeText(await source);
}

type CopyStatus = { target: "prompt" | "page"; ok: boolean };

interface AskAiProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** The page to ask about. Defaults to the canonical URL, else origin + pathname, read when the menu opens. */
  url?: string;
  /** A Markdown version of the page. Enables "Copy page" and "View as Markdown". */
  markdownUrl?: string;
  /** Prompt template. `{url}` becomes the page URL. */
  prompt?: string;
  labels?: Partial<AskAiLabels>;
  /** Replaces the ChatGPT, Claude and Google AI Mode links. */
  providers?: AskAiProvider[];
}

function AskAi({
  url,
  markdownUrl,
  prompt = DEFAULT_PROMPT,
  labels,
  providers,
  className,
  ...props
}: AskAiProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [pageUrl, setPageUrl] = useState(url ?? "");
  const [status, setStatus] = useState<CopyStatus | null>(null);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  const filled = prompt.split("{url}").join(url ?? pageUrl);
  const links = providers ?? [
    {
      id: "chatgpt",
      label: text.chatgpt,
      href: "https://chatgpt.com/?prompt={prompt}",
      icon: <BrandIcon path={OPENAI} className={ICON} />,
    },
    {
      id: "claude",
      label: text.claude,
      href: "https://claude.ai/new?q={prompt}",
      icon: <BrandIcon path={CLAUDE} className={ICON} />,
    },
    {
      id: "google",
      label: text.google,
      href: "https://www.google.com/search?udm=50&q={prompt}",
      icon: <BrandIcon path={GOOGLE} className={ICON} />,
    },
  ];

  const copy = (
    target: CopyStatus["target"],
    source: string | Promise<string>
  ) =>
    copyText(source).then(
      () => setStatus({ target, ok: true }),
      () => setStatus({ target, ok: false })
    );

  const statusLabel = (target: CopyStatus["target"], idle: string) =>
    status?.target === target ? (status.ok ? text.copied : text.failed) : idle;

  const statusIcon = (target: CopyStatus["target"], idle: React.ReactNode) =>
    status?.target === target && status.ok ? (
      <CheckIcon className={ICON} />
    ) : (
      idle
    );

  return (
    <div data-slot="ask-ai" className={cn("w-fit", className)} {...props}>
      <DropdownMenu
        onOpenChange={(open) => {
          if (open && url === undefined) setPageUrl(currentPageUrl());
        }}
      >
        <DropdownMenuTrigger
          render={
            <Button
              variant="secondary"
              className="h-8 gap-1.5 rounded-2xl pr-2.5 pl-3 text-sm sm:h-6 sm:gap-1 sm:pr-2 sm:pl-2.5 sm:text-xs"
            >
              {text.trigger}
              <ChevronDownIcon className={ICON} />
            </Button>
          }
        />
        <DropdownMenuContent className="w-auto rounded-2xl shadow-lg">
          <DropdownMenuGroup>
            {links.map((provider) => (
              <DropdownMenuItem
                key={provider.id}
                className={ITEM}
                render={
                  <a
                    href={providerHref(provider.href, filled)}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                {provider.icon}
                {provider.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-foreground/5" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className={ITEM}
              closeOnClick={false}
              onClick={() => copy("prompt", filled)}
            >
              {statusIcon("prompt", <SparklesIcon className={ICON} />)}
              {statusLabel("prompt", text.other)}
            </DropdownMenuItem>
            {markdownUrl && (
              <>
                <DropdownMenuItem
                  className={ITEM}
                  closeOnClick={false}
                  onClick={() => copy("page", fetchText(markdownUrl))}
                >
                  {statusIcon("page", <CopyIcon className={ICON} />)}
                  {statusLabel("page", text.copyPage)}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={ITEM}
                  render={
                    <a
                      href={markdownUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <BrandIcon path={MARKDOWN} className={ICON} />
                  {text.viewMarkdown}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <span role="status" className="sr-only">
        {status ? (status.ok ? text.copied : text.failed) : ""}
      </span>
    </div>
  );
}

export { AskAi, type AskAiLabels, type AskAiProvider };
