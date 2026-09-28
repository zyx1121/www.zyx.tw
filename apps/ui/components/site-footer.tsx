import { BottomCorners, cornerLink } from "@workspace/ui/components/corners";

import { ENTER, enter, enterAfter } from "@/lib/layout";
import { MARKDOWN_PATH, SOURCE_URL } from "@/lib/site";

export function SiteFooter() {
  return (
    <BottomCorners
      fade
      className={enter}
      style={enterAfter(ENTER.footer)}
      links={
        <>
          <a href={SOURCE_URL} className={cornerLink}>
            GitHub
          </a>
          <a href={MARKDOWN_PATH} className={cornerLink}>
            Markdown
          </a>
        </>
      }
    />
  );
}
