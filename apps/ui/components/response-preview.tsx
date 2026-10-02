"use client";
import { T, useLocale } from "@workspace/ui/components/locale-provider";
import { MarkdownResponse } from "@/components/markdown-response";

const sample =
  '## 回覆格式\n\n**重點**、*補充*、~~已完成~~ 與 `inline code`。\n\n1. 整理需求\n2. 建立可操作的範例\n\n- [x] Markdown\n- [ ] 下一步\n\n> 引用內容保留層次。\n\n| 元件 | 狀態 |\n| --- | --- |\n| Chat | 可用 |\n| JSON | 可用 |\n\n```typescript\nexport async function greet(name: string) {\n  return { message: `Hello, ${name}!` };\n}\n```\n\n```json\n{"customer":"示範客戶","enabled":true,"items":[{"id":1,"name":"文件摘要"}]}\n```\n\n[更多元件](https://ui.zyx.tw)';

const englishSample =
  '## Response format\n\n**Key point**, *details*, ~~done~~ and `inline code`.\n\n1. Gather requirements\n2. Build an interactive example\n\n- [x] Markdown\n- [ ] Next step\n\n> Quotes preserve hierarchy.\n\n| Component | Status |\n| --- | --- |\n| Chat | Available |\n| JSON | Available |\n\n```typescript\nexport async function greet(name: string) {\n  return { message: `Hello, ${name}!` };\n}\n```\n\n```json\n{"customer":"Demo customer","enabled":true,"items":[{"id":1,"name":"Document summary"}]}\n```\n\n[More components](https://ui.zyx.tw)';

export function ResponsePreview() {
  return (
    <section className="min-w-0 space-y-5">
      <h2 className="text-sm/6 font-medium">
        <T>{"Markdown、程式碼與 JSON"}</T>
      </h2>
      <MarkdownResponse
        content={useLocale() === "en" ? englishSample : sample}
      />
    </section>
  );
}
