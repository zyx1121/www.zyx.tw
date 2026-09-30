"use client";
import { useState } from "react";
import { FileText, ArrowUp } from "lucide-react";

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
  const [value, setValue] = useState(""),
    [message, setMessage] = useState("What should we explore?");
  return (
    <div className="space-y-5">
      <h3>Message, bubble and attachment</h3>
      <MessageGroup>
        <Message align="end">
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>{message}</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message>
          <MessageContent>
            <Bubble variant="ghost">
              <BubbleContent>
                Messages and files share the same theme. This is an interface
                preview; no model is connected.
              </BubbleContent>
            </Bubble>
            <Attachment>
              <AttachmentMedia>
                <FileText />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>Example document.pdf</AttachmentTitle>
                <AttachmentDescription>
                  Attachment preview
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
          aria-label="Preview message"
          placeholder="Try a message"
          maxLength={500}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            aria-label="Send preview message"
            size="icon"
            disabled={!value.trim()}
          >
            <ArrowUp />
          </Button>
        </div>
      </form>
    </div>
  );
}
