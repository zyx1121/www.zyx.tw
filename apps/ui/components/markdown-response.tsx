"use client";
import { T, useT } from "@workspace/ui/components/locale-provider";

import { memo, useMemo, useState, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { common, createLowlight } from "lowlight";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import styles from "./markdown-response.module.css";

const highlighter = createLowlight(common);
type HighlightNode = ReturnType<
  typeof highlighter.highlight
>["children"][number];

function renderToken(node: HighlightNode, key: number): ReactNode {
  if (node.type === "text") return node.value;
  if (node.type !== "element") return null;
  return (
    <span
      key={key}
      className={
        Array.isArray(node.properties.className)
          ? node.properties.className.join(" ")
          : undefined
      }
    >
      {node.children.map(renderToken)}
    </span>
  );
}

export const CodeBlock = memo(function CodeBlock({
  code,
  language = "text",
}: {
  code: string;
  language?: string;
}) {
  const t = useT();

  const [raw, setRaw] = useState(false);
  const formatted = useMemo(() => {
    if (!["json", "jsonc"].includes(language.toLowerCase())) return null;
    try {
      return JSON.stringify(JSON.parse(code), null, 2);
    } catch {
      return null;
    }
  }, [code, language]);
  const display = !raw && formatted !== null ? formatted : code;
  const highlighted = useMemo(() => {
    // Bound synchronous highlighting during streaming; unknown languages stay readable.
    if (display.length > 20000 || !highlighter.registered(language))
      return display;
    try {
      return highlighter.highlight(language, display).children.map(renderToken);
    } catch {
      return display;
    }
  }, [display, language]);
  return (
    <div data-slot="code-block" className={styles.codeBlock}>
      <div className="flex items-center justify-between gap-3 border-b px-3 py-1.5 text-xs text-muted-foreground">
        <span>{language}</span>
        <div className="flex items-center gap-1">
          {formatted !== null && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRaw((value) => !value)}
            >
              <T>{raw ? "格式化" : "原始內容"}</T>
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("複製程式碼")}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(display);
                toast.success(t("已複製"));
              } catch {
                toast.error(t("無法存取剪貼簿"));
              }
            }}
          >
            <Copy />
          </Button>
        </div>
      </div>
      <pre tabIndex={0} aria-label={t("{language} code", { language })}>
        <code className={`language-${language}`}>{highlighted}</code>
      </pre>
    </div>
  );
});

export const MarkdownResponse = memo(function MarkdownResponse({
  content,
}: {
  content: string;
}) {
  const t = useT();
  // Models sometimes return a JSON object/array without a code fence.
  const bareJson = useMemo(() => {
    if (!["[", "{"].includes(content.trimStart().charAt(0))) return false;
    try {
      const value = JSON.parse(content);
      return value !== null && typeof value === "object";
    } catch {
      return false;
    }
  }, [content]);
  return (
    <div data-slot="markdown-response" className={styles.markdown}>
      {bareJson ? (
        <CodeBlock code={content} language="json" />
      ) : (
        <Markdown
          remarkPlugins={[remarkGfm]}
          skipHtml
          components={{
            // No raw HTML or executable embeds. react-markdown sanitizes link protocols.
            pre: ({ children }) => <>{children}</>,
            code: ({ node, className, children }) => {
              const code = String(children);
              const language = /language-([^\s]+)/.exec(className || "")?.[1];
              const block =
                Boolean(language) ||
                code.endsWith("\n") ||
                node?.position?.start.line !== node?.position?.end.line;
              return block ? (
                <CodeBlock code={code.replace(/\n$/, "")} language={language} />
              ) : (
                <code>{children}</code>
              );
            },
            table: ({ children }) => (
              <div className={styles.tableScroll} tabIndex={0}>
                <table>{children}</table>
              </div>
            ),
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            img: ({ alt }) => (
              <span className="text-muted-foreground">
                <T>{"[圖片："}</T>
                {alt || t("圖片")}]
              </span>
            ),
          }}
        >
          {content}
        </Markdown>
      )}
    </div>
  );
});
