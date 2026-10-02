"use client";
import { T, useT } from "@workspace/ui/components/locale-provider";
import { useState } from "react";
import { FileText, ArrowUp } from "lucide-react";

import { ResponsePreview } from "@/components/response-preview";
import { Message, MessageContent, MessageGroup } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
} from "@/components/ui/attachment";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
export function AiPrimitives() {
  const t = useT();

  const [value, setValue] = useState(""),
    [message, setMessage] = useState<string | null>(null);
  return (
    <div className="space-y-5">
      <h3>
        <T>{"Message, bubble and attachment"}</T>
      </h3>
      <MessageGroup>
        <Message align="end">
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>
                {message ?? t("What should we explore?")}
              </BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message>
          <MessageContent>
            <Bubble variant="ghost">
              <BubbleContent>
                <T>
                  {
                    "Messages and files share the same theme. This is an interface preview; no model is connected."
                  }
                </T>
              </BubbleContent>
            </Bubble>
            <Attachment>
              <AttachmentMedia>
                <FileText />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>
                  <T>{"Example document.pdf"}</T>
                </AttachmentTitle>
                <AttachmentDescription>
                  <T>{"Attachment preview"}</T>
                </AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          </MessageContent>
        </Message>
      </MessageGroup>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) {
            setMessage(value.trim());
            setValue("");
          }
        }}
        className="space-y-3 rounded-lg border p-3"
      >
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={t("Preview message")}
          placeholder={t("Try a message")}
          maxLength={500}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            aria-label={t("Send preview message")}
            size="icon"
            disabled={!value.trim()}
          >
            <ArrowUp />
          </Button>
        </div>
      </form>
      <ResponsePreview />
    </div>
  );
}
